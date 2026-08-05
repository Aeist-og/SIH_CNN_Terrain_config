# TerrainVision AI - Autonomous Terrain Recognition System

An AI-powered terrain classification system and web workspace built for real-time surface perception, geotechnical telemetry calculation, Grad-CAM explainability, and PDF report generation.

---

## ⚡ How to Run the Project

### Option A: Unified Launcher (Recommended)
Starts both the Flask backend server (`http://localhost:5000`) and React frontend (`http://localhost:5173`) at once:
```bash
node start.js
```

### Option B: Run Backend & Frontend Separately

1. **Start Flask Backend Server**:
   ```bash
   python api_server.py
   ```
   *Runs on `http://localhost:5000`.*

2. **Start React Frontend App**:
   ```bash
   cd mobile_app
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5173`.*

3. **Run Unit Tests**:
   ```bash
   python tests/test_api.py
   ```

---

## 📂 Project Architecture & Component Layout

- **`mobile_app/` (React + Vite + Tailwind CSS)**:  
  The main web frontend workspace. Features a Landing Page (with 1-click saved demo accounts), Primary Analysis Workspace with Grad-CAM heatmaps, Community Hub (article feed & discussion threads), PDF Studio, and Profile Settings.

- **`api_server.py` (Flask Backend API)**:  
  The REST API server. Handles CNN model predictions (`/api/predict`), PDF report generation (`/api/report/pdf`), health checks (`/api/health`), and database routes (`/api/db/*`).

- **`database.py` (Embedded SQLite Database)**:  
  Zero-dependency embedded SQLite database (`terrainvision.db`). Automatically persists classification runs, operator profiles, community posts, and support complaints. Includes exporting records to CSV/Excel (`/api/db/export/excel`).

- **`model_pipeline/` (Machine Learning Engine)**:  
  Contains preprocessing logic, Keras CNN model inference (`inference.py`), Grad-CAM heatmap engine (`explainability.py`), and ReportLab PDF generator (`reports.py`).

- **`model/terrain_recognition_model.h5`**:  
  Pre-trained CNN model weights classifying 5 terrain types (`grassy`, `marshy`, `rocky`, `sandy`, `snowy`).

- **`app.py` (Streamlit App)**:  
  Legacy Streamlit interface, preserved untouched for standalone backend testing.
