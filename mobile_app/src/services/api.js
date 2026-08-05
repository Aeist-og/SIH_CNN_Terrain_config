let API_HOST_IP = '';
let API_BASE_URL = '';

function getBaseApiUrl() {
  if (API_BASE_URL) return API_BASE_URL;

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin && origin !== 'null' && !origin.includes(':5173')) {
      return `${origin}/api`;
    }
  }

  return 'http://localhost:5000/api';
}

export function setCustomApiHost(ip) {
  if (ip) {
    API_HOST_IP = ip.trim();
    API_BASE_URL = `http://${API_HOST_IP}:5000/api`;
  }
}

export function getApiHost() {
  return API_HOST_IP;
}

/**
 * Generate realistic fallback prediction payload when backend server is offline or restarting
 */
function getMockFallbackPrediction(sampleName) {
  const sampleMap = {
    'test_1.jpg': 'rocky',
    'test_2.jpg': 'marshy',
    'test_3.jpg': 'grassy',
    'test_4.jpg': 'sandy',
    'test_5.jpg': 'snowy'
  };

  const detectedTerrain = sampleMap[sampleName] || 'rocky';

  const implicitQuantities = {
    rocky: {
      roughness: { value_ra: 0.88, qualitative: 'High', description: 'Jagged boulders and loose cobble.' },
      slipperiness: { friction_coefficient: 0.75, qualitative: 'Low', description: 'High dry friction.' },
      treacherousness: { hazard_level: 3, qualitative: 'Moderate', description: 'Chassis scrape risk.' },
      surface_stability: { status: 'Stable', bearing_capacity_kpa: 350 },
      hydration: { moisture_pct: 12, qualitative: 'Low' },
      vegetation: { density_pct: 10, qualitative: 'Low' },
      perception_telemetry: { traversal_safety_index: 74, recommended_max_speed_kmh: 18, wheel_grip_index: 78, recommended_drive_mode: '4WD Low / Rock Crawl' }
    },
    marshy: {
      roughness: { value_ra: 0.48, qualitative: 'Moderate', description: 'Uneven mud and root pools.' },
      slipperiness: { friction_coefficient: 0.22, qualitative: 'High', description: 'Slick waterlogged soil.' },
      treacherousness: { hazard_level: 4, qualitative: 'High', description: 'Wheel spinning risk.' },
      surface_stability: { status: 'Unstable', bearing_capacity_kpa: 45 },
      hydration: { moisture_pct: 92, qualitative: 'Very High' },
      vegetation: { density_pct: 45, qualitative: 'Moderate' },
      perception_telemetry: { traversal_safety_index: 38, recommended_max_speed_kmh: 12, wheel_grip_index: 30, recommended_drive_mode: '4WD Low / Mud & Ruts' }
    },
    grassy: {
      roughness: { value_ra: 0.25, qualitative: 'Low', description: 'Smooth turf.' },
      slipperiness: { friction_coefficient: 0.55, qualitative: 'Moderate', description: 'Moderate traction.' },
      treacherousness: { hazard_level: 1, qualitative: 'Low', description: 'Minimal traversal risk.' },
      surface_stability: { status: 'Stable', bearing_capacity_kpa: 180 },
      hydration: { moisture_pct: 35, qualitative: 'Moderate' },
      vegetation: { density_pct: 85, qualitative: 'High' },
      perception_telemetry: { traversal_safety_index: 92, recommended_max_speed_kmh: 45, wheel_grip_index: 85, recommended_drive_mode: 'Normal / 2WD' }
    },
    sandy: {
      roughness: { value_ra: 0.42, qualitative: 'Moderate', description: 'Granular shifting dunes.' },
      slipperiness: { friction_coefficient: 0.45, qualitative: 'Moderate', description: 'Particulate shear slip.' },
      treacherousness: { hazard_level: 2, qualitative: 'Low-Mod', description: 'Loose momentum risk.' },
      surface_stability: { status: 'Granular', bearing_capacity_kpa: 95 },
      hydration: { moisture_pct: 8, qualitative: 'Low' },
      vegetation: { density_pct: 5, qualitative: 'Very Low' },
      perception_telemetry: { traversal_safety_index: 81, recommended_max_speed_kmh: 30, wheel_grip_index: 62, recommended_drive_mode: 'Sand Mode / Deflated Pressure' }
    },
    snowy: {
      roughness: { value_ra: 0.65, qualitative: 'High', description: 'Compacted ice ridges.' },
      slipperiness: { friction_coefficient: 0.18, qualitative: 'Very High', description: 'Sub-zero ice crust.' },
      treacherousness: { hazard_level: 4, qualitative: 'High', description: 'Icy drift risk.' },
      surface_stability: { status: 'Slippery', bearing_capacity_kpa: 60 },
      hydration: { moisture_pct: 60, qualitative: 'Frozen' },
      vegetation: { density_pct: 5, qualitative: 'Very Low' },
      perception_telemetry: { traversal_safety_index: 42, recommended_max_speed_kmh: 15, wheel_grip_index: 25, recommended_drive_mode: 'Snow & Ice Lock / Chains' }
    }
  };

  return {
    success: true,
    is_mock_fallback: true,
    source: 'Demo Mock Engine (Offline Fallback)',
    predicted_terrain: detectedTerrain,
    confidence: 0.94,
    unsupported_image: false,
    rejection_reason: null,
    all_probabilities: {
      grassy: detectedTerrain === 'grassy' ? 0.94 : 0.02,
      marshy: detectedTerrain === 'marshy' ? 0.94 : 0.01,
      rocky: detectedTerrain === 'rocky' ? 0.94 : 0.02,
      sandy: detectedTerrain === 'sandy' ? 0.94 : 0.01,
      snowy: detectedTerrain === 'snowy' ? 0.94 : 0.00
    },
    implicit_quantities: implicitQuantities[detectedTerrain],
    gradcam_base64: null,
    inference_time_ms: 38,
    model_version: 'terrain-cnn-v1.2.0-mock'
  };
}

/**
 * Perform Terrain Recognition Prediction via Flask Backend with automatic Demo Mock fallback
 */
export async function predictTerrain({ sampleName, base64Image, imageFile }) {
  const tryUrls = [
    getBaseApiUrl(),
    'http://localhost:5000/api',
    '/api'
  ];

  for (const baseUrl of tryUrls) {
    try {
      let body = null;
      let headers = {};

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        body = formData;
      } else if (sampleName) {
        body = JSON.stringify({ sample_name: sampleName });
        headers['Content-Type'] = 'application/json';
      } else if (base64Image) {
        body = JSON.stringify({ image_base64: base64Image });
        headers['Content-Type'] = 'application/json';
      }

      if (body) {
        const response = await fetch(`${baseUrl}/predict`, {
          method: 'POST',
          headers,
          body
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return {
              success: true,
              source: `CNN Inference Engine (${baseUrl})`,
              terrain: data.predicted_terrain,
              predicted_terrain: data.predicted_terrain,
              confidence: data.confidence,
              unsupported_image: data.unsupported_image || false,
              rejection_reason: data.rejection_reason || null,
              probabilities: data.all_probabilities || {},
              implicit: data.implicit_quantities || null,
              gradcam_base64: data.gradcam_base64 || null,
              inference_time_ms: data.inference_time_ms || 0,
              model_version: data.model_version || 'terrain-cnn-v1.2.0'
            };
          }
        }
      }
    } catch (error) {
      // Continue to next endpoint or mock fallback
    }
  }

  // Graceful Fallback / Demo Mock Mode if backend is unreachable
  return getMockFallbackPrediction(sampleName);
}

/**
 * Fetch and download PDF Report from Backend
 */
export async function downloadPdfReport(reportPayload) {
  const tryUrls = [
    getBaseApiUrl(),
    'http://localhost:5000/api',
    '/api'
  ];

  for (const baseUrl of tryUrls) {
    try {
      const response = await fetch(`${baseUrl}/report/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `terrainvision-report-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true };
      }
    } catch (error) {
      // Try next
    }
  }
  return { success: false, error: 'Failed to generate PDF report from backend server.' };
}

export async function exportDatabaseSpreadsheet() {
  const tryUrls = [
    getBaseApiUrl(),
    'http://localhost:5000/api',
    '/api'
  ];

  for (const baseUrl of tryUrls) {
    try {
      const response = await fetch(`${baseUrl}/db/export/excel`, { method: 'GET' });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `terrainvision-database-export-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true };
      }
    } catch (error) {
      // try next
    }
  }
  return { success: false, error: 'Database export unavailable.' };
}

export async function checkServerHealth() {
  const tryUrls = [
    getBaseApiUrl(),
    'http://localhost:5000/api',
    '/api'
  ];

  for (const baseUrl of tryUrls) {
    try {
      const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // try next
    }
  }
  return { success: false, status: 'offline', model_loaded: false };
}
