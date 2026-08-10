import sqlite3
import os
import json
import time
import io
import csv
import logging

DB_FILE = os.path.join(os.path.dirname(__file__), "terrainvision.db")

def get_db_connection():
    """Create a thread-safe connection to SQLite database."""
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables and seed initial community posts if missing."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Analyses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                predicted_terrain TEXT NOT NULL,
                confidence REAL NOT NULL,
                unsupported_image INTEGER DEFAULT 0,
                rejection_reason TEXT,
                probabilities TEXT,
                implicit_quantities TEXT,
                gradcam_base64 TEXT,
                inference_time_ms INTEGER DEFAULT 42,
                model_version TEXT DEFAULT 'terrain-cnn-v1.2.0',
                timestamp TEXT NOT NULL
            )
        ''')

        # 2. User Profiles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL,
                role TEXT NOT NULL,
                confidence_threshold INTEGER DEFAULT 50,
                updated_at TEXT NOT NULL
            )
        ''')

        # 3. Community Posts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS community_posts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                designation TEXT NOT NULL,
                terrain TEXT NOT NULL,
                date_str TEXT NOT NULL,
                likes INTEGER DEFAULT 0,
                safety_index INTEGER DEFAULT 75,
                roughness TEXT,
                drive_mode TEXT,
                summary TEXT NOT NULL
            )
        ''')

        # 4. Community Comments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS community_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id TEXT NOT NULL,
                author TEXT NOT NULL,
                text TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (post_id) REFERENCES community_posts (id)
            )
        ''')

        # 5. Complaints table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS complaints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operator_name TEXT NOT NULL,
                designation TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')

        conn.commit()

        # Seed initial community posts if empty
        cursor.execute('SELECT COUNT(*) FROM community_posts')
        if cursor.fetchone()[0] == 0:
            seed_posts = [
                ('work-1', 'Himalayan High-Altitude Ridge Traversal Assessment', 'Dr. Aris Thorne', 'Lead Geotechnical Rover Specialist', 'rocky', '2026-08-04', 24, 74, '0.88 µm', '4WD Low / Rock Crawl', 'Conducted high-altitude optical classification across jagged granite cobbles. The CNN model achieved 96.2% confidence on rocky substrate.'),
                ('work-2', 'Thar Desert Granular Dune Traction & Shear Slip Study', 'Rover Tech Team', 'Autonomous Navigation Group', 'sandy', '2026-08-02', 18, 81, '0.42 µm', 'Sand Mode / Deflated Pressure', 'Evaluated granular shear slip across shifting crest dunes. Low moisture content required torque vectoring. Classification returned 94.5% sandy confidence.'),
                ('work-3', 'Spiti Valley Waterlogged Wetland & Mud Inundation Test', 'Clara Vance', 'Autonomous Robotics Researcher', 'marshy', '2026-07-29', 31, 38, '0.48 µm', '4WD Low / Mud & Ruts', 'Inundated marsh ground with sub-surface roots resulted in high slipperiness. Safety index dropped to 38/100. Rover speed capped at 12 km/h.')
            ]
            cursor.executemany('''
                INSERT INTO community_posts (id, title, author, designation, terrain, date_str, likes, safety_index, roughness, drive_mode, summary)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', seed_posts)

            seed_comments = [
                ('work-1', 'Rover Tech Team', 'Excellent analysis! We verified the 350 kPa bearing capacity on similar slopes in Spiti.', '2026-08-04 14:20:00'),
                ('work-1', 'Clara Vance', 'Did the Grad-CAM heatmap target the fracture lines or the loose shale base?', '2026-08-04 15:10:00'),
                ('work-2', 'Dr. Aris Thorne', 'Deflated pressure in Sand Mode is essential here to prevent dig-in on steep gradients.', '2026-08-02 11:45:00')
            ]
            cursor.executemany('''
                INSERT INTO community_comments (post_id, author, text, created_at)
                VALUES (?, ?, ?, ?)
            ''', seed_comments)
            conn.commit()

        conn.close()
        logging.info("[Database] SQLite database initialized successfully at %s", DB_FILE)
    except Exception as e:
        logging.error("[Database] Error initializing SQLite database: %s", e)

# Initial setup trigger
init_db()

# --- CRUD Functions ---

def save_analysis(record: dict) -> bool:
    """Save an inference analysis record to SQLite."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO analyses (predicted_terrain, confidence, unsupported_image, rejection_reason, probabilities, implicit_quantities, gradcam_base64, inference_time_ms, model_version, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            record.get('predicted_terrain', 'grassy'),
            float(record.get('confidence', 0.95)),
            1 if record.get('unsupported_image') else 0,
            record.get('rejection_reason'),
            json.dumps(record.get('all_probabilities') or {}),
            json.dumps(record.get('implicit_quantities') or {}),
            record.get('gradcam_base64'),
            int(record.get('inference_time_ms', 42)),
            record.get('model_version', 'terrain-cnn-v1.2.0'),
            record.get('timestamp', time.strftime("%Y-%m-%d %H:%M:%S"))
        ))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error("[Database] Failed to save analysis record: %s", e)
        return False

def get_analyses(limit: int = 50) -> list:
    """Retrieve history of analysis runs."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM analyses ORDER BY id DESC LIMIT ?', (limit,))
        rows = cursor.fetchall()
        conn.close()

        result = []
        for r in rows:
            result.append({
                'id': r['id'],
                'terrain': r['predicted_terrain'],
                'predicted_terrain': r['predicted_terrain'],
                'confidence': r['confidence'],
                'unsupported_image': bool(r['unsupported_image']),
                'rejection_reason': r['rejection_reason'],
                'all_probabilities': json.loads(r['probabilities']) if r['probabilities'] else {},
                'implicit_quantities': json.loads(r['implicit_quantities']) if r['implicit_quantities'] else {},
                'gradcam_base64': r['gradcam_base64'],
                'inference_time_ms': r['inference_time_ms'],
                'model_version': r['model_version'],
                'timestamp': r['timestamp']
            })
        return result
    except Exception as e:
        logging.error("[Database] Failed to fetch analyses: %s", e)
        return []

def get_profile(email: str = 'operator@terrainvision.ai') -> dict:
    """Get user profile from database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM user_profiles WHERE email = ?', (email,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                'email': row['email'],
                'username': row['username'],
                'role': row['role'],
                'confidence_threshold': row['confidence_threshold']
            }
    except Exception as e:
        logging.error("[Database] Failed to fetch profile: %s", e)
    return {'email': email, 'username': 'SIH Operator', 'role': 'Autonomous Specialist', 'confidence_threshold': 50}

def save_profile(data: dict) -> bool:
    """Save or update user profile in database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        email = data.get('email', 'operator@terrainvision.ai')
        username = data.get('username', 'SIH Operator')
        role = data.get('role', 'Autonomous Specialist')
        threshold = int(data.get('confidence_threshold', 50))
        now_str = time.strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute('''
            INSERT INTO user_profiles (email, username, role, confidence_threshold, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET
                username = excluded.username,
                role = excluded.role,
                confidence_threshold = excluded.confidence_threshold,
                updated_at = excluded.updated_at
        ''', (email, username, role, threshold, now_str))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error("[Database] Failed to save profile: %s", e)
        return False

def get_community_posts() -> list:
    """Retrieve community posts with their discussion comments."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM community_posts ORDER BY likes DESC')
        posts = [dict(r) for r in cursor.fetchall()]

        for p in posts:
            cursor.execute('SELECT author, text FROM community_comments WHERE post_id = ? ORDER BY id ASC', (p['id'],))
            p['comments'] = [dict(c) for c in cursor.fetchall()]

        conn.close()
        return posts
    except Exception as e:
        logging.error("[Database] Failed to fetch community posts: %s", e)
        return []

def add_community_comment(post_id: str, author: str, text: str) -> bool:
    """Add comment to a community post."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO community_comments (post_id, author, text, created_at)
            VALUES (?, ?, ?, ?)
        ''', (post_id, author, text, time.strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error("[Database] Failed to add comment: %s", e)
        return False

def like_community_post(post_id: str) -> bool:
    """Increment likes on a community post."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE community_posts SET likes = likes + 1 WHERE id = ?', (post_id,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error("[Database] Failed to like post: %s", e)
        return False

def log_complaint(operator_name: str, designation: str, message: str) -> bool:
    """Log support complaint into database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO complaints (operator_name, designation, message, created_at)
            VALUES (?, ?, ?, ?)
        ''', (operator_name, designation, message, time.strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error("[Database] Failed to log complaint: %s", e)
        return False

def add_community_post(post: dict) -> bool:
    """Publish a new field analysis / model report to community posts."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        post_id = f"work-{int(time.time())}"
        cursor.execute('''
            INSERT INTO community_posts (id, title, author, designation, terrain, date_str, likes, safety_index, roughness, drive_mode, summary)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post_id,
            post.get('title', 'Autonomous Terrain Assessment'),
            post.get('author', 'SIH Operator'),
            post.get('designation', 'Specialist'),
            post.get('terrain', 'rocky'),
            time.strftime("%Y-%m-%d"),
            0,
            int(post.get('safety_index', 75)),
            post.get('roughness', '0.50 µm'),
            post.get('drive_mode', 'Normal / 2WD'),
            post.get('summary', 'Published autonomous model classification analysis.')
        ))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logging.error("[Database] Failed to add community post: %s", e)
        return False

def export_to_csv() -> str:
    """Export analyses, telemetry, profiles, and complaints as a CSV spreadsheet."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["=== TERRAINVISION AI - CLASSIFICATION & TELEMETRY LOGS ==="])
        writer.writerow(["ID", "Timestamp", "Predicted Terrain", "Confidence", "Status", "Visual Roughness Index", "Visual Wetness Indicator", "Hazard Rating", "Rover Safety Score", "Traversal Mode"])
        
        cursor.execute('SELECT * FROM analyses ORDER BY id DESC')
        rows = cursor.fetchall()
        for r in rows:
            analysis = json.loads(r['implicit_quantities']) if r['implicit_quantities'] else {}
            rough = analysis.get('visual_roughness', {}).get('index', 'N/A')
            wet = analysis.get('visual_wetness', {}).get('index', 'N/A')
            haz = analysis.get('hazard_rating', 'N/A')
            safety = analysis.get('rover_safety_score', 'N/A')
            drive = analysis.get('traversal_mode', 'N/A')
            
            writer.writerow([
                r['id'],
                r['timestamp'],
                r['predicted_terrain'],
                f"{r['confidence']*100:.1f}%",
                "Rejected" if r['unsupported_image'] else "Verified",
                rough, wet, haz, safety, drive
            ])
            
        writer.writerow([])
        writer.writerow(["=== OPERATOR PROFILES ==="])
        writer.writerow(["ID", "Username", "Email", "Role", "Safety Threshold"])
        cursor.execute('SELECT * FROM user_profiles')
        for p in cursor.fetchall():
            writer.writerow([p['id'], p['username'], p['email'], p['role'], f"{p['confidence_threshold']}%"])
            
        conn.close()
        return output.getvalue()
    except Exception as e:
        logging.error("[Database] Failed to export CSV: %s", e)
        return "ID,Timestamp,Predicted Terrain,Confidence\n"
