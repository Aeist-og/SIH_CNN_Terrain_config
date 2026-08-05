import os
import io
import time
import logging
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory, send_file, Response
from flask_cors import CORS

from model_pipeline.config import SAMPLES_DIR, MODEL_VERSION, TERRAIN_CLASSES
from model_pipeline.preprocessing import load_image_from_bytes, decode_base64_image
from model_pipeline.inference import TerrainPredictor
from model_pipeline.reports import generate_pdf_report
import database

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)

app = Flask(__name__)
# Restrict maximum upload payload to 16MB to prevent DoS memory exhaustion
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
CORS(app, resources={r"/api/*": {"origins": "*"}})

FRONTEND_DIST_DIR = os.path.realpath(os.path.join(os.path.dirname(__file__), "mobile_app", "dist"))

# Initialize model predictor singleton
predictor = TerrainPredictor()

@app.errorhandler(404)
def handle_404(e):
    """Clean JSON 404 handler for unknown routes or API endpoints."""
    if request.path.startswith('/api/') or request.is_json or request.accept_mimetypes.accept_json:
        return jsonify({
            'success': False,
            'error': 'Not Found',
            'message': f'Requested API resource or endpoint "{request.path}" does not exist.'
        }), 404
    
    # Fallback to SPA index.html if available
    index_path = os.path.join(FRONTEND_DIST_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_DIST_DIR, 'index.html')
    
    return jsonify({
        'success': False,
        'error': 'Not Found',
        'message': f'Requested resource "{request.path}" does not exist.'
    }), 404

@app.errorhandler(405)
def handle_405(e):
    """Clean JSON 405 Method Not Allowed handler."""
    return jsonify({
        'success': False,
        'error': 'Method Not Allowed',
        'message': f'HTTP method {request.method} is not supported for endpoint "{request.path}".'
    }), 405

@app.errorhandler(413)
def handle_413(e):
    """Payload Too Large handler."""
    return jsonify({
        'success': False,
        'error': 'Payload Too Large',
        'message': 'Uploaded file exceeds the maximum allowed payload size limit of 16MB.'
    }), 413

@app.errorhandler(500)
def handle_500(e):
    """Clean JSON 500 Internal Server Error handler."""
    logging.error(f"Internal server error encountered: {e}", exc_info=True)
    return jsonify({
        'success': False,
        'error': 'Internal Server Error',
        'message': 'An internal processing error occurred on the server.'
    }), 500

@app.route('/', methods=['GET'])
def index():
    """Serve index.html from React build or return API status notice."""
    index_path = os.path.join(FRONTEND_DIST_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_DIST_DIR, 'index.html')

    return """
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>TerrainVision AI - API Service</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070B08; color: #EDF1EC; padding: 40px; }
            h1 { color: #10B981; }
            a { color: #34D399; text-decoration: none; }
            a:hover { text-decoration: underline; }
            code { background: #121814; padding: 4px 8px; border-radius: 4px; color: #34D399; }
        </style>
    </head>
    <body>
        <h1>TerrainVision AI API Service</h1>
        <p>The backend inference server is active and online.</p>
        <p>Supported Endpoints:</p>
        <ul>
            <li><a href="/api/health"><code>GET /api/health</code></a> (or <code>/health</code>)</li>
            <li><a href="/api/samples"><code>GET /api/samples</code></a> (or <code>/samples</code>)</li>
            <li><code>POST /api/predict</code> (or <code>/predict</code>)</li>
            <li><code>POST /api/report/pdf</code> (or <code>/report/pdf</code>)</li>
        </ul>
    </body>
    </html>
    """, 200

@app.route('/api/health', methods=['GET'])
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'success': True,
        'status': 'online',
        'model_loaded': predictor.is_ready(),
        'model_version': MODEL_VERSION,
        'supported_classes': TERRAIN_CLASSES,
        'timestamp': time.time()
    })

@app.route('/api/samples', methods=['GET'])
@app.route('/samples', methods=['GET'])
def get_samples():
    """List available sample dataset images."""
    if not os.path.exists(SAMPLES_DIR):
        return jsonify({'success': True, 'samples': []})
    
    try:
        files = [f for f in os.listdir(SAMPLES_DIR) if f.lower().endswith(('.jpg', '.png', '.jpeg', '.webp'))]
        sample_list = []
        
        terrain_map = {
          'test_1.jpg': 'Rocky Slope',
          'test_2.jpg': 'Waterlogged Marsh',
          'test_3.jpg': 'Meadow Pasture',
          'test_4.jpg': 'Desert Dunes',
          'test_5.jpg': 'Arctic Ice'
        }

        for f in sorted(files):
            pretty_name = terrain_map.get(f, f.replace('_', ' ').replace('.jpg', '').replace('.png', '').title())
            sample_list.append({
                'filename': f,
                'name': pretty_name,
                'url': f'/api/samples/{f}'
            })
        return jsonify({'success': True, 'samples': sample_list})
    except Exception as e:
        logging.error(f"Error fetching samples: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/samples/<filename>', methods=['GET'])
@app.route('/samples/<filename>', methods=['GET'])
def serve_sample(filename):
    """Serve sample image asset."""
    safe_filename = os.path.basename(filename)
    return send_from_directory(SAMPLES_DIR, safe_filename)

@app.route('/api/predict', methods=['POST'])
@app.route('/predict', methods=['POST'])
def predict():
    """
    Perform terrain classification, confidence threshold evaluation, and Grad-CAM explainability.
    Accepts:
    - Multipart file upload under key 'image'
    - JSON payload with 'image_base64'
    - JSON payload with 'sample_name'
    """
    try:
        pil_image = None

        # 1. Parse Image Input
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                image_bytes = file.read()
                pil_image = load_image_from_bytes(image_bytes)

        elif request.is_json:
            data = request.get_json(silent=True) or {}
            if 'image_base64' in data and data['image_base64']:
                pil_image = decode_base64_image(data['image_base64'])
            elif 'sample_name' in data and data['sample_name']:
                sample_path = os.path.join(SAMPLES_DIR, os.path.basename(data['sample_name']))
                if os.path.exists(sample_path):
                    pil_image = Image.open(sample_path).convert('RGB')

        if pil_image is None:
            return jsonify({
                'success': False,
                'error': 'No valid image provided. Please provide a file upload ("image"), "image_base64", or "sample_name".'
            }), 400

        # 2. Execute Inference Pipeline
        result = predictor.predict(pil_image)
        if result and result.get('success'):
            database.save_analysis(result)
        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error during terrain prediction: {e}", exc_info=True)
        return jsonify({'success': False, 'error': f"Inference processing failure: {str(e)}"}), 500

@app.route('/api/db/history', methods=['GET', 'POST'])
def db_history():
    """Retrieve or insert analysis history records in SQLite database."""
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        database.save_analysis(data)
        return jsonify({'success': True}), 200
    rows = database.get_analyses()
    return jsonify({'success': True, 'history': rows}), 200

@app.route('/api/db/profile', methods=['GET', 'POST'])
def db_profile():
    """Retrieve or update operator user profile in SQLite database."""
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        database.save_profile(data)
        return jsonify({'success': True}), 200
    email = request.args.get('email', 'operator@terrainvision.ai')
    profile = database.get_profile(email)
    return jsonify({'success': True, 'profile': profile}), 200

@app.route('/api/db/community', methods=['GET'])
def db_community_posts():
    """Retrieve community field works and comments from SQLite database."""
    posts = database.get_community_posts()
    return jsonify({'success': True, 'posts': posts}), 200

@app.route('/api/db/community/comment', methods=['POST'])
def db_community_comment():
    """Add a review comment to a community field report."""
    data = request.get_json(silent=True) or {}
    post_id = data.get('post_id')
    author = data.get('author', 'SIH Operator')
    text = data.get('text', '')
    if post_id and text:
        database.add_community_comment(post_id, author, text)
        return jsonify({'success': True}), 200
    return jsonify({'success': False, 'error': 'Missing post_id or text'}), 400

@app.route('/api/db/community/like', methods=['POST'])
def db_community_like():
    """Like a community field report."""
    data = request.get_json(silent=True) or {}
    post_id = data.get('post_id')
    if post_id:
        database.like_community_post(post_id)
        return jsonify({'success': True}), 200
    return jsonify({'success': False, 'error': 'Missing post_id'}), 400

@app.route('/api/db/community/post', methods=['POST'])
def db_community_create_post():
    """Publish a model report / field analysis to the community hub."""
    data = request.get_json(silent=True) or {}
    if database.add_community_post(data):
        return jsonify({'success': True}), 200
    return jsonify({'success': False, 'error': 'Failed to publish post'}), 500

@app.route('/api/db/export/excel', methods=['GET'])
@app.route('/api/db/export/csv', methods=['GET'])
def db_export_excel():
    """Export SQLite database records as CSV/Excel spreadsheet download."""
    csv_data = database.export_to_csv()
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={
            'Content-Disposition': 'attachment; filename=terrainvision-database-export.csv',
            'Content-Type': 'text/csv'
        }
    )

@app.route('/api/report/pdf', methods=['POST'])
@app.route('/report/pdf', methods=['POST'])
def export_pdf_report():
    """
    Generate and stream a professional PDF evaluation report for terrain classification.
    Accepts JSON containing prediction results or parameters.
    """
    try:
        pil_image = None
        data = request.get_json(silent=True) or {}

        # Extract image if provided in request
        if 'image_base64' in data and data['image_base64']:
            try:
                pil_image = decode_base64_image(data['image_base64'])
            except Exception:
                pass
        elif 'sample_name' in data and data['sample_name']:
            sample_path = os.path.join(SAMPLES_DIR, os.path.basename(data['sample_name']))
            if os.path.exists(sample_path):
                pil_image = Image.open(sample_path).convert('RGB')

        # If payload contains result object nested
        prediction_payload = data.get('result') or data

        pdf_bytes = generate_pdf_report(prediction_payload, orig_pil_image=pil_image)

        return Response(
            pdf_bytes,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': 'attachment; filename=terrainvision-assessment-report.pdf',
                'Content-Type': 'application/pdf'
            }
        )
    except Exception as e:
        logging.error(f"Error generating PDF report: {e}", exc_info=True)
        return jsonify({'success': False, 'error': f"Failed to generate PDF report: {str(e)}"}), 500

@app.route('/<path:path>', methods=['GET'])
def serve_frontend(path):
    """Fallback static handler for SPA routing with strict path traversal validation."""
    if path:
        target_path = os.path.realpath(os.path.join(FRONTEND_DIST_DIR, path))
        if target_path.startswith(FRONTEND_DIST_DIR) and os.path.exists(target_path) and os.path.isfile(target_path):
            relative_path = os.path.relpath(target_path, FRONTEND_DIST_DIR)
            return send_from_directory(FRONTEND_DIST_DIR, relative_path)

    index_path = os.path.join(FRONTEND_DIST_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_DIST_DIR, 'index.html')

    return jsonify({'success': False, 'error': 'Not Found', 'message': f'Frontend asset or API endpoint "{path}" not found'}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting TerrainVision AI Backend API on http://0.0.0.0:{port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
