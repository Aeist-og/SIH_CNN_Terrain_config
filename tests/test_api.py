import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api_server import app
from model_pipeline.config import TERRAIN_CLASSES, IMPLICIT_QUANTITIES, CONFIDENCE_THRESHOLD

class ApiServerTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_root_endpoint(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(b'TerrainVision AI' in response.data or b'<!DOCTYPE html>' in response.data)

    def test_health_endpoint(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['status'], 'online')
        self.assertIn('supported_classes', data)
        self.assertEqual(len(data['supported_classes']), 5)

    def test_samples_endpoint(self):
        response = self.client.get('/api/samples')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertIn('samples', data)
        self.assertIsInstance(data['samples'], list)

    def test_predict_missing_payload(self):
        response = self.client.post('/api/predict', json={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data['success'])
        self.assertIn('error', data)

    def test_pdf_report_endpoint(self):
        sample_payload = {
            'predicted_terrain': 'rocky',
            'confidence': 0.94,
            'unsupported_image': False,
            'timestamp': '2026-08-04 17:00:00 UTC',
            'implicit_quantities': IMPLICIT_QUANTITIES['rocky']
        }
        response = self.client.post('/api/report/pdf', json=sample_payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, 'application/pdf')
        self.assertGreater(len(response.data), 500)

    def test_implicit_quantities_completeness(self):
        expected_terrains = {'grassy', 'marshy', 'rocky', 'sandy', 'snowy'}
        self.assertEqual(set(TERRAIN_CLASSES), expected_terrains)
        for terrain in expected_terrains:
            self.assertIn(terrain, IMPLICIT_QUANTITIES)
            quantities = IMPLICIT_QUANTITIES[terrain]
            self.assertIn('roughness', quantities)
            self.assertIn('slipperiness', quantities)
            self.assertIn('treacherousness', quantities)
            self.assertIn('surface_stability', quantities)
            self.assertIn('perception_telemetry', quantities)

if __name__ == '__main__':
    unittest.main()
