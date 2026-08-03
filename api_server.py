import os
import io
import base64
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from tensorflow.keras.models import load_model # type: ignore
from tensorflow.keras.preprocessing.image import img_to_array # type: ignore

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model/terrain_recognition_model.h5"
SAMPLES_DIR = "static/samples"
FRONTEND_DIST_DIR = os.path.join(os.path.dirname(__file__), "mobile_app", "dist")

# Load the CNN model
print(f"Loading CNN model from {MODEL_PATH}...")
try:
    model = load_model(MODEL_PATH)
    print("CNN model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

TERRAIN_CLASSES = ['grassy', 'marshy', 'rocky', 'sandy', 'snowy']

@app.route('/', methods=['GET'])
def index():
    index_path = os.path.join(FRONTEND_DIST_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_file(index_path, mimetype='text/html')

    return """
    <!doctype html>
    <html lang=\"en\">
    <head>
        <meta charset=\"utf-8\">
        <title>Terrain Recognition API</title>
    </head>
    <body>
        <h1>Terrain Recognition API</h1>
        <p>The API is running.</p>
        <p>The redesigned frontend build is not available yet. Please build the web app first.</p>
        <ul>
            <li><a href=\"/api/health\">/api/health</a></li>
            <li><a href=\"/api/samples\">/api/samples</a></li>
            <li><a href=\"/api/predict\">/api/predict</a></li>
        </ul>
    </body>
    </html>
    """

IMPLICIT_QUANTITIES = {
    'grassy': {
        'roughness': {
            'qualitative': 'Low',
            'value_ra': 0.25, # Ra in µm / relative scale
            'score': 25,
            'description': 'Smooth surface with minor micro-textural variations.'
        },
        'slipperiness': {
            'qualitative': 'Moderate',
            'friction_coefficient': 0.55, # μ
            'score': 45,
            'description': 'Moderate traction; slight slippage if dew or moisture is present.'
        },
        'treacherousness': {
            'qualitative': 'Low',
            'hazard_level': 1,
            'score': 15,
            'description': 'Minimal traversal risk for conventional and autonomous rovers.'
        },
        'vegetation': {
            'density_pct': 85,
            'qualitative': 'High'
        },
        'hydration': {
            'moisture_pct': 35,
            'qualitative': 'Moderate'
        },
        'surface_stability': {
            'status': 'Stable',
            'bearing_capacity_kpa': 180,
            'score': 88
        },
        'perception_telemetry': {
            'traversal_safety_index': 92,
            'recommended_max_speed_kmh': 45,
            'wheel_grip_index': 85,
            'recommended_drive_mode': 'Normal / 2WD'
        }
    },
    'marshy': {
        'roughness': {
            'qualitative': 'Moderate',
            'value_ra': 0.48,
            'score': 50,
            'description': 'Uneven water-logged soil with submerged roots and mud pools.'
        },
        'slipperiness': {
            'qualitative': 'High',
            'friction_coefficient': 0.22,
            'score': 85,
            'description': 'Extremely slick surface. High probability of traction loss.'
        },
        'treacherousness': {
            'qualitative': 'High',
            'hazard_level': 4,
            'score': 80,
            'description': 'High risk of sinking, wheels spinning, and vehicle immobilization.'
        },
        'vegetation': {
            'density_pct': 45,
            'qualitative': 'Moderate'
        },
        'hydration': {
            'moisture_pct': 92,
            'qualitative': 'Very High'
        },
        'surface_stability': {
            'status': 'Unstable (Deformable)',
            'bearing_capacity_kpa': 45,
            'score': 25
        },
        'perception_telemetry': {
            'traversal_safety_index': 38,
            'recommended_max_speed_kmh': 12,
            'wheel_grip_index': 30,
            'recommended_drive_mode': '4WD Low / Mud & Ruts'
        }
    },
    'rocky': {
        'roughness': {
            'qualitative': 'High',
            'value_ra': 0.88,
            'score': 90,
            'description': 'Jagged boulders, loose cobble, and severe angular surface relief.'
        },
        'slipperiness': {
            'qualitative': 'Low',
            'friction_coefficient': 0.75,
            'score': 20,
            'description': 'High dry mechanical interlock and strong tire friction.'
        },
        'treacherousness': {
            'qualitative': 'Moderate',
            'hazard_level': 3,
            'score': 60,
            'description': 'Risk of chassis scrape, tipping, and tire puncture.'
        },
        'vegetation': {
            'density_pct': 10,
            'qualitative': 'Low'
        },
        'hydration': {
            'moisture_pct': 12,
            'qualitative': 'Low'
        },
        'surface_stability': {
            'status': 'Stable / Hard Substrate',
            'bearing_capacity_kpa': 350,
            'score': 95
        },
        'perception_telemetry': {
            'traversal_safety_index': 74,
            'recommended_max_speed_kmh': 18,
            'wheel_grip_index': 78,
            'recommended_drive_mode': '4WD Low / Rock Crawl'
        }
    },
    'sandy': {
        'roughness': {
            'qualitative': 'Moderate',
            'value_ra': 0.42,
            'score': 45,
            'description': 'Granular particulate medium with shifting ripples and dunes.'
        },
        'slipperiness': {
            'qualitative': 'Moderate',
            'friction_coefficient': 0.45,
            'score': 55,
            'description': 'Moderate shear slip under heavy torque; grain displacement.'
        },
        'treacherousness': {
            'qualitative': 'Low - Moderate',
            'hazard_level': 2,
            'score': 35,
            'description': 'Risk of wheel dig-in if momentum is lost on loose steep slopes.'
        },
        'vegetation': {
            'density_pct': 5,
            'qualitative': 'Very Low'
        },
        'hydration': {
            'moisture_pct': 8,
            'qualitative': 'Very Low'
        },
        'surface_stability': {
            'status': 'Loose / Granular',
            'bearing_capacity_kpa': 95,
            'score': 55
        },
        'perception_telemetry': {
            'traversal_safety_index': 81,
            'recommended_max_speed_kmh': 30,
            'wheel_grip_index': 62,
            'recommended_drive_mode': 'Sand Mode / Deflated Pressure'
        }
    },
    'snowy': {
        'roughness': {
            'qualitative': 'High',
            'value_ra': 0.65,
            'score': 70,
            'description': 'Snow drifts, compacted ice ridges, and sub-zero surface crust.'
        },
        'slipperiness': {
            'qualitative': 'High',
            'friction_coefficient': 0.18,
            'score': 90,
            'description': 'Severe ice lubrication. Ultra-low dynamic friction coefficient.'
        },
        'treacherousness': {
            'qualitative': 'High',
            'hazard_level': 4,
            'score': 82,
            'description': 'High probability of skidding, loss of steering, and icy drift.'
        },
        'vegetation': {
            'density_pct': 5,
            'qualitative': 'Very Low'
        },
        'hydration': {
            'moisture_pct': 60,
            'qualitative': 'High (Frozen)'
        },
        'surface_stability': {
            'status': 'Variable / Slippery',
            'bearing_capacity_kpa': 60,
            'score': 35
        },
        'perception_telemetry': {
            'traversal_safety_index': 42,
            'recommended_max_speed_kmh': 15,
            'wheel_grip_index': 25,
            'recommended_drive_mode': 'Snow & Ice Lock / Chains'
        }
    }
}

def preprocess_image_file(pil_img):
    img = pil_img.resize((224, 224)).convert('RGB')
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'model_loaded': model is not None,
        'supported_classes': TERRAIN_CLASSES
    })

@app.route('/api/samples', methods=['GET'])
def get_samples():
    if not os.path.exists(SAMPLES_DIR):
        return jsonify({'samples': []})
    
    files = [f for f in os.listdir(SAMPLES_DIR) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
    sample_list = []
    for f in files:
        file_path = os.path.join(SAMPLES_DIR, f)
        sample_list.append({
            'filename': f,
            'url': f'/api/samples/{f}'
        })
    return jsonify({'samples': sample_list})

@app.route('/api/samples/<filename>', methods=['GET'])
def serve_sample(filename):
    return send_from_directory(SAMPLES_DIR, filename)

@app.route('/<path:path>', methods=['GET'])
def serve_frontend(path):
    if path.startswith('api/') or path == 'api':
        return jsonify({'error': 'Not found'}), 404

    asset_path = os.path.join(FRONTEND_DIST_DIR, path)
    if path and os.path.exists(asset_path):
        return send_from_directory(FRONTEND_DIST_DIR, path)

    index_path = os.path.join(FRONTEND_DIST_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_file(index_path, mimetype='text/html')

    return jsonify({'error': 'Frontend build not found'}), 404

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        pil_image = None
        
        # Check if file is uploaded via multipart/form-data
        if 'image' in request.files:
            file = request.files['image']
            pil_image = Image.open(file.stream)
        elif request.is_json:
            data = request.get_json()
            if 'image_base64' in data:
                b64_str = data['image_base64']
                if ',' in b64_str:
                    b64_str = b64_str.split(',')[1]
                image_bytes = base64.b64decode(b64_str)
                pil_image = Image.open(io.BytesIO(image_bytes))
            elif 'sample_name' in data:
                sample_path = os.path.join(SAMPLES_DIR, data['sample_name'])
                if os.path.exists(sample_path):
                    pil_image = Image.open(sample_path)
        
        if pil_image is None:
            return jsonify({'error': 'No valid image provided. Provide multipart file "image", "image_base64", or "sample_name".'}), 400

        # Perform inference
        if model is not None:
            processed_img = preprocess_image_file(pil_image)
            preds = model.predict(processed_img)[0]
            pred_idx = int(np.argmax(preds))
            terrain = TERRAIN_CLASSES[pred_idx]
            confidence = float(preds[pred_idx])
            
            all_probabilities = {TERRAIN_CLASSES[i]: float(preds[i]) for i in range(len(TERRAIN_CLASSES))}
        else:
            # Fallback mock prediction if model is not loaded
            terrain = 'grassy'
            confidence = 0.95
            all_probabilities = {c: (0.95 if c == 'grassy' else 0.01) for c in TERRAIN_CLASSES}

        # Get implicit quantities for the predicted terrain
        implicit = IMPLICIT_QUANTITIES.get(terrain, IMPLICIT_QUANTITIES['grassy'])

        return jsonify({
            'success': True,
            'predicted_terrain': terrain,
            'confidence': confidence,
            'all_probabilities': all_probabilities,
            'implicit_quantities': implicit
        })

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Terrain Recognition API server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
