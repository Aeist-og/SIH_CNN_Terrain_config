let API_HOST_IP = '';
let API_BASE_URL = '';

function getBaseApiUrl() {
  if (API_BASE_URL) return API_BASE_URL;

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const isDevPort = /:(3000|5173|5174|5175|8080|4173)$/.test(origin);
    if (origin && origin !== 'null' && !isDevPort) {
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
 * Generate fallback prediction payload when backend server is offline or restarting
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

  const mockAnalysis = {
    rocky: {
      visual_roughness: { index: 88, qualitative: 'High / Severe Roughness', description: 'Jagged boulders & irregular relief' },
      visual_wetness: { index: 12, qualitative: 'Low / Arid Surface', description: 'Minimal surface liquid cues' },
      traction_potential: 78,
      ground_stability: { score: 92, status: 'High Stability / Hard Substrate' },
      hazard_rating: 3,
      hazard_factors: ['High surface roughness & irregular relief', 'Chassis scrape risk'],
      rover_safety_score: 74,
      traversal_mode: 'ROCK CRAWL',
      drive_profile: '4WD Low / Rock Crawl',
      recommended_speed_range: '5–12 km/h'
    },
    marshy: {
      visual_roughness: { index: 48, qualitative: 'Moderate Surface Relief', description: 'Uneven mud & root pools' },
      visual_wetness: { index: 92, qualitative: 'High / Waterlogged Cues', description: 'Dark reflectivity & water highlights' },
      traction_potential: 30,
      ground_stability: { score: 25, status: 'Unstable / Deformable Substrate' },
      hazard_rating: 4,
      hazard_factors: ['Elevated moisture & slippage risk', 'Deformable terrain'],
      rover_safety_score: 38,
      traversal_mode: 'STOP / AVOID',
      drive_profile: '4WD Low / Mud & Ruts',
      recommended_speed_range: '0–5 km/h'
    },
    grassy: {
      visual_roughness: { index: 25, qualitative: 'Low / Smooth Surface', description: 'Smooth turf texture' },
      visual_wetness: { index: 35, qualitative: 'Moderate Moisture Cues', description: 'Damp vegetation spectrum' },
      traction_potential: 85,
      ground_stability: { score: 88, status: 'High Stability / Firm Ground' },
      hazard_rating: 1,
      hazard_factors: ['Favorable terrain traversal conditions'],
      rover_safety_score: 92,
      traversal_mode: 'NORMAL',
      drive_profile: 'Standard 2WD / Normal Traversal',
      recommended_speed_range: '20–35 km/h'
    },
    sandy: {
      visual_roughness: { index: 42, qualitative: 'Moderate Surface Relief', description: 'Granular shifting dunes' },
      visual_wetness: { index: 8, qualitative: 'Low / Arid Surface', description: 'Dry particulate medium' },
      traction_potential: 62,
      ground_stability: { score: 55, status: 'Moderate Stability / Granular' },
      hazard_rating: 2,
      hazard_factors: ['Loose grain momentum displacement'],
      rover_safety_score: 81,
      traversal_mode: 'CAUTIOUS',
      drive_profile: 'Sand Mode / Deflated Pressure',
      recommended_speed_range: '12–20 km/h'
    },
    snowy: {
      visual_roughness: { index: 65, qualitative: 'High / Severe Roughness', description: 'Compacted ice ridges' },
      visual_wetness: { index: 60, qualitative: 'Moderate Moisture Cues', description: 'Sub-zero frozen crust' },
      traction_potential: 25,
      ground_stability: { score: 40, status: 'Unstable / Deformable Substrate' },
      hazard_rating: 4,
      hazard_factors: ['Severe ice lubrication & skidding risk'],
      rover_safety_score: 42,
      traversal_mode: 'STOP / AVOID',
      drive_profile: 'Snow & Ice Lock / Chains',
      recommended_speed_range: '0–5 km/h'
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
    probabilities: {
      grassy: detectedTerrain === 'grassy' ? 0.94 : 0.02,
      marshy: detectedTerrain === 'marshy' ? 0.94 : 0.01,
      rocky: detectedTerrain === 'rocky' ? 0.94 : 0.02,
      sandy: detectedTerrain === 'sandy' ? 0.94 : 0.01,
      snowy: detectedTerrain === 'snowy' ? 0.94 : 0.00
    },
    implicit_quantities: mockAnalysis[detectedTerrain],
    analysis: mockAnalysis[detectedTerrain],
    gradcam_base64: null,
    inference_time_ms: 38,
    model_version: 'terrain-cnn-v1.2.0-fallback'
  };
}

/**
 * Perform Terrain Recognition Prediction via Flask Backend
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
            const predTerrain = data.classification?.label || data.predicted_terrain || 'unknown';
            const conf = data.classification?.confidence ?? data.confidence ?? 0.0;
            const probs = data.probabilities || data.all_probabilities || {};
            const analysisData = data.analysis || data.implicit_quantities || null;

            return {
              success: true,
              source: `CNN Inference Engine (${baseUrl})`,
              terrain: predTerrain,
              predicted_terrain: predTerrain,
              confidence: conf,
              unsupported_image: data.unsupported_image || (predTerrain === 'unknown'),
              rejection_reason: data.rejection_reason || null,
              probabilities: probs,
              all_probabilities: probs,
              implicit: analysisData,
              analysis: analysisData,
              gradcam_base64: data.gradcam_base64 || null,
              inference_time_ms: data.inference?.latency_ms || data.inference_time_ms || 0,
              model_version: data.model_version || 'terrain-cnn-v1.2.0'
            };
          }
        }
      }
    } catch (error) {
      // Continue next attempt
    }
  }

  // All real backend attempts failed — log explicitly so the failure is visible in the browser console
  console.error(
    '[TerrainVision] ⚠️ All backend API attempts failed. Tried URLs:',
    tryUrls.map(u => `${u}/predict`),
    '\nThe backend server (api_server.py) may not be running on port 5000.',
    '\nReturning backend-offline error instead of mock data.'
  );

  // Return a real error — do NOT silently return mock data
  return {
    success: false,
    error: 'Backend inference server is unreachable. Please ensure api_server.py is running on port 5000.',
    is_backend_offline: true
  };
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

/**
 * Export Database to CSV/Excel Spreadsheet
 */
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

/**
 * Fetch Analysis History from SQLite Database
 */
export async function fetchDbHistory() {
  const tryUrls = [getBaseApiUrl(), 'http://localhost:5000/api', '/api'];
  for (const baseUrl of tryUrls) {
    try {
      const res = await fetch(`${baseUrl}/db/history`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data.history;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Fetch User Profile from SQLite Database
 */
export async function fetchDbProfile(email) {
  const tryUrls = [getBaseApiUrl(), 'http://localhost:5000/api', '/api'];
  for (const baseUrl of tryUrls) {
    try {
      const res = await fetch(`${baseUrl}/db/profile?email=${encodeURIComponent(email || '')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data.profile;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Save User Profile to SQLite Database
 */
export async function saveDbProfile(profileData) {
  const tryUrls = [getBaseApiUrl(), 'http://localhost:5000/api', '/api'];
  for (const baseUrl of tryUrls) {
    try {
      const res = await fetch(`${baseUrl}/db/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) return true;
    } catch (e) {}
  }
  return false;
}

/**
 * Fetch Community Posts from SQLite Database
 */
export async function fetchDbCommunity() {
  const tryUrls = [getBaseApiUrl(), 'http://localhost:5000/api', '/api'];
  for (const baseUrl of tryUrls) {
    try {
      const res = await fetch(`${baseUrl}/db/community`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data.posts;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Post Community Comment to SQLite Database
 */
export async function postDbCommunityComment(postId, author, text) {
  const tryUrls = [getBaseApiUrl(), 'http://localhost:5000/api', '/api'];
  for (const baseUrl of tryUrls) {
    try {
      const res = await fetch(`${baseUrl}/db/community/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, author, text })
      });
      if (res.ok) return true;
    } catch (e) {}
  }
  return false;
}

/**
 * Like Community Post in SQLite Database
 */
export async function postDbCommunityLike(postId) {
  const tryUrls = [getBaseApiUrl(), 'http://localhost:5000/api', '/api'];
  for (const baseUrl of tryUrls) {
    try {
      const res = await fetch(`${baseUrl}/db/community/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      });
      if (res.ok) return true;
    } catch (e) {}
  }
  return false;
}

/**
 * Publish Community Article to SQLite Database
 */
export async function postDbCommunityArticle(postPayload) {
  const tryUrls = [getBaseApiUrl(), 'http://localhost:5000/api', '/api'];
  for (const baseUrl of tryUrls) {
    try {
      const res = await fetch(`${baseUrl}/db/community/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload)
      });
      if (res.ok) return true;
    } catch (e) {}
  }
  return false;
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
