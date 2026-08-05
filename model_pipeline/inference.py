import os
import time
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model # type: ignore

from .config import (
    MODEL_PATH,
    TERRAIN_CLASSES,
    CONFIDENCE_THRESHOLD,
    MODEL_VERSION,
    IMPLICIT_QUANTITIES
)
from .preprocessing import preprocess_for_inference
from .explainability import generate_gradcam_heatmap, image_to_base64_data_url

class TerrainPredictor:
    """Singleton / wrapper for CNN model loading and robust terrain inference."""

    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.load_model_weights()

    def load_model_weights(self):
        if os.path.exists(self.model_path):
            try:
                print(f"[ModelPipeline] Loading trained CNN model from {self.model_path}...")
                self.model = load_model(self.model_path)
                print("[ModelPipeline] Model loaded successfully!")
            except Exception as e:
                print(f"[ModelPipeline] Error loading model weights: {e}")
                self.model = None
        else:
            print(f"[ModelPipeline] Model file {self.model_path} not found.")

    def is_ready(self) -> bool:
        return self.model is not None

    def predict(self, pil_image: Image.Image) -> dict:
        start_time = time.time()
        
        if not self.is_ready():
            return {
                'success': False,
                'error': 'Model weights not loaded or backend model unavailable.',
                'model_version': MODEL_VERSION
            }

        # 1. Preprocess
        processed_img = preprocess_for_inference(pil_image)

        # 2. Perform Model Inference
        raw_preds = self.model.predict(processed_img, verbose=0)[0]
        pred_idx = int(np.argmax(raw_preds))
        confidence = float(raw_preds[pred_idx])

        all_probs = {TERRAIN_CLASSES[i]: float(raw_preds[i]) for i in range(len(TERRAIN_CLASSES))}

        # 3. Check Confidence Threshold Rejection (Phase 4 requirement)
        if confidence < CONFIDENCE_THRESHOLD:
            predicted_terrain = "Unsupported Image"
            is_unsupported = True
            rejection_reason = (
                f"Classification confidence ({confidence:.1%}) is below the required "
                f"{CONFIDENCE_THRESHOLD * 100:.0f}% safety threshold. The input image does not "
                "match any supported terrain category."
            )
            implicit = None
        else:
            predicted_terrain = TERRAIN_CLASSES[pred_idx]
            is_unsupported = False
            rejection_reason = None
            implicit = IMPLICIT_QUANTITIES.get(predicted_terrain, IMPLICIT_QUANTITIES['grassy'])

        # 4. Generate AI Explainability (Grad-CAM)
        gradcam_b64 = None
        if self.model and not is_unsupported:
            gradcam_pil = generate_gradcam_heatmap(self.model, processed_img, pred_idx)
            if gradcam_pil:
                gradcam_b64 = image_to_base64_data_url(gradcam_pil)

        elapsed_ms = int((time.time() - start_time) * 1000)

        return {
            'success': True,
            'predicted_terrain': predicted_terrain,
            'confidence': confidence,
            'unsupported_image': is_unsupported,
            'rejection_reason': rejection_reason,
            'all_probabilities': all_probs,
            'implicit_quantities': implicit,
            'gradcam_base64': gradcam_b64,
            'inference_time_ms': elapsed_ms,
            'model_version': MODEL_VERSION,
            'timestamp': time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        }
