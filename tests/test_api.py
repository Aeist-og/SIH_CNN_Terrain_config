import unittest
import os
import sys

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api_server import app, TERRAIN_CLASSES, IMPLICIT_QUANTITIES

class ApiServerTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_health_endpoint(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'online')
        self.assertIn('supported_classes', data)
        self.assertEqual(len(data['supported_classes']), 5)

    def test_samples_endpoint(self):
        response = self.client.get('/api/samples')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('samples', data)
        self.assertIsInstance(data['samples'], list)

    def test_predict_missing_payload(self):
        response = self.client.post('/api/predict', json={})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)

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
