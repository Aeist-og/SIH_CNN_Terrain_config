import io
import base64
import numpy as np
from PIL import Image
import tensorflow as tf

def find_last_conv_layer(model):
    """Locate the name of the final Conv2D layer in the Keras sequential/functional model."""
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D) or 'conv' in layer.name.lower():
            return layer.name
    return None

def generate_gradcam_heatmap(model, img_array, pred_index=None):
    """
    Computes real Grad-CAM heatmaps for a Keras model and image array.
    Returns PIL Image of overlaid Grad-CAM, or None if unavailable.
    """
    try:
        layer_name = find_last_conv_layer(model)
        if not layer_name:
            return None

        conv_layer = model.get_layer(layer_name)

        # Construct gradient model
        grad_model = tf.keras.models.Model(
            inputs=[model.inputs],
            outputs=[conv_layer.output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            if pred_index is None:
                pred_index = tf.argmax(predictions[0])
            loss = predictions[:, pred_index]

        # Extract gradients of target score w.r.t feature map
        grads = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        # Apply ReLU activation to heatmaps
        heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + 1e-10)
        heatmap = heatmap.numpy()

        if np.isnan(heatmap).any():
            return None

        # Resize heatmap to 224x224
        heatmap_img = Image.fromarray(np.uint8(255 * heatmap)).resize((224, 224), Image.Resampling.BILINEAR)
        heatmap_np = np.array(heatmap_img) / 255.0

        # Custom JET color mapping (Blue -> Cyan -> Yellow -> Red)
        r = np.clip(1.5 - np.abs(heatmap_np * 4 - 3), 0, 1)
        g = np.clip(1.5 - np.abs(heatmap_np * 4 - 2), 0, 1)
        b = np.clip(1.5 - np.abs(heatmap_np * 4 - 1), 0, 1)
        color_heatmap = np.stack([r, g, b], axis=-1)

        # Prepare original input image
        raw_img_channel = img_array[0]
        if raw_img_channel.max() <= 1.0:
            orig_img = np.clip(raw_img_channel * 255.0, 0, 255).astype(np.uint8)
        else:
            orig_img = np.clip(raw_img_channel, 0, 255).astype(np.uint8)
        
        orig_pil = Image.fromarray(orig_img).resize((224, 224)).convert('RGB')
        orig_np = np.array(orig_pil) / 255.0

        # Overlay blend (50% original, 50% heatmap)
        blended = (0.5 * orig_np + 0.5 * color_heatmap)
        blended = np.clip(blended * 255, 0, 255).astype(np.uint8)

        return Image.fromarray(blended)
    except Exception as e:
        print(f"[Grad-CAM Notice] Explainability calculation unavailable: {e}")
        return None

def image_to_base64_data_url(pil_img: Image.Image) -> str:
    """Convert PIL Image to data:image/png;base64 string."""
    buffered = io.BytesIO()
    pil_img.save(buffered, format="PNG")
    b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
