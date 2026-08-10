"""
Automated Pipeline Test Suite for TerrainVision AI.
Verifies model loading, inference accuracy, probability normalization, OOD rejection, visual proxy calculations, and PDF generation.
"""

import os
import sys
import unittest
import numpy as np
from PIL import Image

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from model_pipeline.inference import TerrainPredictor
from model_pipeline.validation import validate_image_input, evaluate_ood_status
from model_pipeline.terrain_analysis import compute_visual_roughness, compute_visual_wetness, analyze_terrain_from_image
from model_pipeline.reports import generate_pdf_report
from model_pipeline.config import TERRAIN_CLASSES

class TestTerrainAnalysisPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        model_path = os.path.join(PROJECT_ROOT, "model", "terrain_recognition_model.h5")
        cls.predictor = TerrainPredictor(model_path)

    def test_01_model_loaded(self):
        """Verify model weights load correctly and predictor is ready."""
        self.assertTrue(self.predictor.is_ready(), "Model predictor failed to initialize.")

    def test_02_sample_images_inference(self):
        """Verify inference on all sample images produces valid predictions and probabilities sum to ~1.0."""
        samples_dir = os.path.join(PROJECT_ROOT, "static", "samples")
        if not os.path.exists(samples_dir):
            self.skipTest(f"Samples directory {samples_dir} not found.")

        sample_files = [f for f in os.listdir(samples_dir) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
        self.assertGreater(len(sample_files), 0, "No sample images found for testing.")

        for f in sample_files:
            img_path = os.path.join(samples_dir, f)
            img = Image.open(img_path)
            res = self.predictor.predict(img)

            self.assertTrue(res.get('success'), f"Inference failed for {f}")
            
            probs = res.get('probabilities') or res.get('all_probabilities')
            self.assertIsNotNone(probs, f"Missing probabilities dictionary for {f}")
            
            prob_sum = sum(probs.values())
            self.assertAlmostEqual(prob_sum, 1.0, places=3, msg=f"Probabilities sum for {f} is {prob_sum}, expected ~1.0")

            classification = res.get('classification', {})
            pred_label = classification.get('label') or res.get('predicted_terrain')
            
            if not res.get('unsupported_image'):
                max_prob_class = max(probs, key=probs.get)
                self.assertEqual(pred_label, max_prob_class, f"Argmax mismatch for {f}: predicted={pred_label}, max_prob={max_prob_class}")

    def test_03_ood_rejection_for_blank_or_noise_images(self):
        """Verify blank or extreme flat images are flagged as unknown / rejected."""
        # Flat white image
        white_img = Image.new('RGB', (224, 224), color=(255, 255, 255))
        is_valid, err = validate_image_input(white_img)
        self.assertFalse(is_valid, "Flat white image should fail validation.")
        self.assertIn("blank", err.lower())

        # Flat black image
        black_img = Image.new('RGB', (224, 224), color=(0, 0, 0))
        is_valid, err = validate_image_input(black_img)
        self.assertFalse(is_valid, "Flat black image should fail validation.")

    def test_04_visual_terrain_proxies(self):
        """Verify image-derived proxies calculate valid 0-100 indicators without hardcoded physical units."""
        samples_dir = os.path.join(PROJECT_ROOT, "static", "samples")
        test_img_path = os.path.join(samples_dir, "test_1.jpg")
        if not os.path.exists(test_img_path):
            self.skipTest(f"Test image {test_img_path} not found.")

        img = Image.open(test_img_path)
        analysis = analyze_terrain_from_image(img, "rocky", 0.94)

        self.assertIn('visual_roughness', analysis)
        self.assertIn('visual_wetness', analysis)
        self.assertIn('traction_potential', analysis)
        self.assertIn('rover_safety_score', analysis)
        self.assertIn('hazard_rating', analysis)
        self.assertIn('traversal_mode', analysis)

        r_idx = analysis['visual_roughness']['index']
        w_idx = analysis['visual_wetness']['index']
        safety = analysis['rover_safety_score']
        hazard = analysis['hazard_rating']

        self.assertTrue(0 <= r_idx <= 100, f"Roughness index {r_idx} out of range [0, 100]")
        self.assertTrue(0 <= w_idx <= 100, f"Wetness index {w_idx} out of range [0, 100]")
        self.assertTrue(0 <= safety <= 100, f"Safety score {safety} out of range [0, 100]")
        self.assertTrue(1 <= hazard <= 5, f"Hazard rating {hazard} out of range [1, 5]")

    def test_05_pdf_report_generation(self):
        """Verify PDF report generation completes cleanly."""
        samples_dir = os.path.join(PROJECT_ROOT, "static", "samples")
        test_img_path = os.path.join(samples_dir, "test_1.jpg")
        if not os.path.exists(test_img_path):
            self.skipTest(f"Test image {test_img_path} not found.")

        img = Image.open(test_img_path)
        res = self.predictor.predict(img)
        pdf_bytes = generate_pdf_report(res, orig_pil_image=img)

        self.assertIsNotNone(pdf_bytes)
        self.assertGreater(len(pdf_bytes), 1000, "Generated PDF is empty or suspiciously small.")

if __name__ == '__main__':
    unittest.main()
