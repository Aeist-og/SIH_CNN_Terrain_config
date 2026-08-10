import os
import time
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model # type: ignore

from .config import (
    MODEL_PATH,
    TERRAIN_CLASSES,
    MODEL_VERSION
)
from .preprocessing import preprocess_for_inference
from .validation import validate_image_input, evaluate_ood_status
from .terrain_analysis import analyze_terrain_from_image
from .explainability import generate_gradcam_heatmap, image_to_base64_data_url

class TerrainPredictor:
    """Singleton / wrapper for CNN model loading and robust terrain inference."""

    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.load_model_weights()

    def load_model_weights(self):
        """Loads trained Keras model with compile=False for fast initialization (~1.8s)."""
        if os.path.exists(self.model_path):
            try:
                print(f"[ModelPipeline] Loading CNN terrain model from {self.model_path} (compile=False)...")
                t0 = time.time()
                self.model = load_model(self.model_path, compile=False)
                print(f"[ModelPipeline] Model loaded successfully in {time.time() - t0:.2f}s!")
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

        # 1. Image Pre-Validation
        is_valid, validation_error = validate_image_input(pil_image)
        if not is_valid:
            return {
                'success': True,
                'classification': {
                    'label': 'unknown',
                    'confidence': 0.0,
                    'status': 'rejected'
                },
                'predicted_terrain': 'unknown',
                'confidence': 0.0,
                'unsupported_image': True,
                'rejection_reason': validation_error,
                'probabilities': {cls: 0.0 for cls in TERRAIN_CLASSES},
                'all_probabilities': {cls: 0.0 for cls in TERRAIN_CLASSES},
                'analysis': None,
                'implicit_quantities': None,
                'gradcam_base64': None,
                'inference_time_ms': int((time.time() - start_time) * 1000),
                'model_version': MODEL_VERSION,
                'timestamp': time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
            }

        # 2. Preprocess Image
        processed_img = preprocess_for_inference(pil_image)

        # 3. Model Inference & Softmax Normalization
        raw_preds = self.model.predict(processed_img, verbose=0)[0]
        
        # Ensure numerical stability and exact probability sum = 1.0
        exp_preds = np.exp(raw_preds - np.max(raw_preds)) if np.max(raw_preds) > 10.0 else raw_preds
        probs = exp_preds / np.sum(exp_preds)
        
        pred_idx = int(np.argmax(probs))
        confidence = float(probs[pred_idx])
        
        # Sort probabilities to compute margin (p_top1 - p_top2)
        sorted_probs = np.sort(probs)[::-1]
        margin = float(sorted_probs[0] - sorted_probs[1]) if len(sorted_probs) > 1 else float(sorted_probs[0])
        
        # Calculate Shannon entropy (H = -sum p_i ln p_i)
        safe_probs = np.clip(probs, 1e-12, 1.0)
        entropy = float(-np.sum(safe_probs * np.log(safe_probs)))

        all_probs = {TERRAIN_CLASSES[i]: float(probs[i]) for i in range(len(TERRAIN_CLASSES))}

        # 4. Two-Stage OOD / Unknown Decision Logic
        is_rejected, status_label, rejection_reason = evaluate_ood_status(
            probabilities=all_probs,
            top_confidence=confidence,
            entropy_val=entropy,
            margin_val=margin,
            pil_img=pil_image
        )

        if is_rejected:
            predicted_terrain = "unknown"
            is_unsupported = True
            analysis = None
        else:
            predicted_terrain = TERRAIN_CLASSES[pred_idx]
            is_unsupported = False
            # Calculate dynamic visual indicators and traversability heuristics
            analysis = analyze_terrain_from_image(pil_image, predicted_terrain, confidence)

        # 5. Explainability (Grad-CAM) Heatmap
        gradcam_b64 = None
        if self.model and not is_rejected:
            gradcam_pil = generate_gradcam_heatmap(self.model, processed_img, pred_idx)
            if gradcam_pil:
                gradcam_b64 = image_to_base64_data_url(gradcam_pil)

        elapsed_ms = int((time.time() - start_time) * 1000)

        # Clean API Response Schema matching Master Prompt specifications
        return {
            'success': True,
            'classification': {
                'label': predicted_terrain,
                'confidence': round(confidence, 4),
                'status': status_label,
                'entropy': round(entropy, 4),
                'margin': round(margin, 4)
            },
            'probabilities': all_probs,
            # Dual output format for backward compatibility with frontend consumers
            'predicted_terrain': predicted_terrain,
            'confidence': round(confidence, 4),
            'unsupported_image': is_unsupported,
            'rejection_reason': rejection_reason,
            'all_probabilities': all_probs,
            'analysis': analysis,
            'implicit_quantities': analysis,  # maps to analysis for frontend
            'gradcam_base64': gradcam_b64,
            'inference': {
                'latency_ms': elapsed_ms
            },
            'inference_time_ms': elapsed_ms,
            'model_version': MODEL_VERSION,
            'timestamp': time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        }
