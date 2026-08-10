import os

MODEL_PATH = os.path.join("model", "terrain_recognition_model.h5")
SAMPLES_DIR = os.path.join("static", "samples")

TARGET_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 0.40
MODEL_VERSION = "terrain-cnn-v1.2.0"

TERRAIN_CLASSES = ['grassy', 'marshy', 'rocky', 'sandy', 'snowy']

IMPLICIT_QUANTITIES = {
    'grassy': {
        'visual_roughness': {'index': 25, 'qualitative': 'Low / Smooth Surface', 'description': 'Smooth turf texture with minimal spatial variance.'},
        'visual_wetness': {'index': 35, 'qualitative': 'Moderate Moisture Cues', 'description': 'Damp vegetation spectrum'},
        'traction_potential': 85,
        'ground_stability': {'score': 88, 'status': 'High Stability / Firm Ground'},
        'hazard_rating': 1,
        'hazard_factors': ['Favorable terrain traversal conditions'],
        'rover_safety_score': 92,
        'traversal_mode': 'NORMAL',
        'drive_profile': 'Standard 2WD / Normal Traversal',
        'recommended_speed_range': '20–35 km/h'
    },
    'marshy': {
        'visual_roughness': {'index': 48, 'qualitative': 'Moderate Surface Relief', 'description': 'Uneven mud & root pools'},
        'visual_wetness': {'index': 92, 'qualitative': 'High / Waterlogged Cues', 'description': 'Dark reflectivity & water highlights'},
        'traction_potential': 30,
        'ground_stability': {'score': 25, 'status': 'Unstable / Deformable Substrate'},
        'hazard_rating': 4,
        'hazard_factors': ['Elevated moisture & slippage risk', 'Deformable terrain'],
        'rover_safety_score': 38,
        'traversal_mode': 'STOP / AVOID',
        'drive_profile': '4WD Low / Mud & Ruts Protocol',
        'recommended_speed_range': '0–5 km/h'
    },
    'rocky': {
        'visual_roughness': {'index': 88, 'qualitative': 'High / Severe Roughness', 'description': 'Jagged boulders & irregular relief'},
        'visual_wetness': {'index': 12, 'qualitative': 'Low / Arid Surface', 'description': 'Minimal surface liquid cues'},
        'traction_potential': 78,
        'ground_stability': {'score': 92, 'status': 'High Stability / Hard Substrate'},
        'hazard_rating': 3,
        'hazard_factors': ['High surface roughness & irregular relief', 'Chassis scrape risk'],
        'rover_safety_score': 74,
        'traversal_mode': 'ROCK CRAWL',
        'drive_profile': '4WD Low / Rock Crawl Mode',
        'recommended_speed_range': '5–12 km/h'
    },
    'sandy': {
        'visual_roughness': {'index': 42, 'qualitative': 'Moderate Surface Relief', 'description': 'Granular shifting dunes'},
        'visual_wetness': {'index': 8, 'qualitative': 'Low / Arid Surface', 'description': 'Dry particulate medium'},
        'traction_potential': 62,
        'ground_stability': {'score': 55, 'status': 'Moderate Stability / Granular'},
        'hazard_rating': 2,
        'hazard_factors': ['Loose grain momentum displacement'],
        'rover_safety_score': 81,
        'traversal_mode': 'CAUTIOUS',
        'drive_profile': 'Sand Mode / Deflated Pressure',
        'recommended_speed_range': '12–20 km/h'
    },
    'snowy': {
        'visual_roughness': {'index': 65, 'qualitative': 'High / Severe Roughness', 'description': 'Compacted ice ridges'},
        'visual_wetness': {'index': 60, 'qualitative': 'Moderate Moisture Cues', 'description': 'Sub-zero frozen crust'},
        'traction_potential': 25,
        'ground_stability': {'score': 40, 'status': 'Unstable / Deformable Substrate'},
        'hazard_rating': 4,
        'hazard_factors': ['Severe ice lubrication & skidding risk'],
        'rover_safety_score': 42,
        'traversal_mode': 'STOP / AVOID',
        'drive_profile': 'Snow & Ice Lock / Chain Assist',
        'recommended_speed_range': '0–5 km/h'
    }
}
