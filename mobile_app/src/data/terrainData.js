// TERRAIN_THEMES — visual styling tokens used by App.jsx for theming the UI per terrain type.
// These are purely presentation constants (colors, gradients, badge colors).
export const TERRAIN_THEMES = {
  grassy: {
    label: 'Grassy Surface',
    color: '#10b981',
    lightColor: 'rgba(16, 185, 129, 0.15)',
    gradient: ['#059669', '#10b981', '#34d399'],
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeText: '#34d399',
    iconName: 'tree-pine'
  },
  marshy: {
    label: 'Marshy / Muddy',
    color: '#06b6d4',
    lightColor: 'rgba(6, 182, 212, 0.15)',
    gradient: ['#0891b2', '#06b6d4', '#22d3ee'],
    badgeBg: 'rgba(6, 182, 212, 0.2)',
    badgeText: '#67e8f9',
    iconName: 'droplets'
  },
  rocky: {
    label: 'Rocky Bedrock',
    color: '#8b5cf6',
    lightColor: 'rgba(139, 92, 246, 0.15)',
    gradient: ['#7c3aed', '#8b5cf6', '#a78bfa'],
    badgeBg: 'rgba(139, 92, 246, 0.2)',
    badgeText: '#c084fc',
    iconName: 'mountain'
  },
  sandy: {
    label: 'Sandy Dunes',
    color: '#f59e0b',
    lightColor: 'rgba(245, 158, 11, 0.15)',
    gradient: ['#d97706', '#f59e0b', '#fbbf24'],
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeText: '#fde047',
    iconName: 'sun'
  },
  snowy: {
    label: 'Snowy / Ice Layer',
    color: '#38bdf8',
    lightColor: 'rgba(56, 189, 248, 0.15)',
    gradient: ['#0284c7', '#38bdf8', '#7dd3fc'],
    badgeBg: 'rgba(56, 189, 248, 0.2)',
    badgeText: '#bae6fd',
    iconName: 'snowflake'
  }
};

// DEFAULT_IMPLICIT_QUANTITIES — class-level fallback proxies used when the backend is offline.
// These are ONLY used by the mock fallback engine in api.js; the real backend returns
// image-derived values computed by terrain_analysis.py at inference time.
export const DEFAULT_IMPLICIT_QUANTITIES = {
  grassy: {
    visual_roughness: { index: 25, qualitative: 'Low / Smooth Surface', description: 'Smooth turf texture with minimal spatial variance.' },
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
  marshy: {
    visual_roughness: { index: 48, qualitative: 'Moderate Surface Relief', description: 'Uneven mud & root pools' },
    visual_wetness: { index: 92, qualitative: 'High / Waterlogged Cues', description: 'Dark reflectivity & water highlights' },
    traction_potential: 30,
    ground_stability: { score: 25, status: 'Unstable / Deformable Substrate' },
    hazard_rating: 4,
    hazard_factors: ['Elevated moisture & slippage risk', 'Deformable terrain'],
    rover_safety_score: 38,
    traversal_mode: 'STOP / AVOID',
    drive_profile: '4WD Low / Mud & Ruts Protocol',
    recommended_speed_range: '0–5 km/h'
  },
  rocky: {
    visual_roughness: { index: 88, qualitative: 'High / Severe Roughness', description: 'Jagged boulders & irregular relief' },
    visual_wetness: { index: 12, qualitative: 'Low / Arid Surface', description: 'Minimal surface liquid cues' },
    traction_potential: 78,
    ground_stability: { score: 92, status: 'High Stability / Hard Substrate' },
    hazard_rating: 3,
    hazard_factors: ['High surface roughness & irregular relief', 'Chassis scrape risk'],
    rover_safety_score: 74,
    traversal_mode: 'ROCK CRAWL',
    drive_profile: '4WD Low / Rock Crawl Mode',
    recommended_speed_range: '5–12 km/h'
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
    drive_profile: 'Snow & Ice Lock / Chain Assist',
    recommended_speed_range: '0–5 km/h'
  }
};

export const SAMPLE_IMAGES = [
  { id: 'test_1', name: 'Sample 1 (Rocky Slope)', sample_name: 'test_1.jpg', hint: 'rocky' },
  { id: 'test_2', name: 'Sample 2 (Marshy Land)', sample_name: 'test_2.jpg', hint: 'marshy' },
  { id: 'test_3', name: 'Sample 3 (Grassy Field)', sample_name: 'test_3.jpg', hint: 'grassy' },
  { id: 'test_4', name: 'Sample 4 (Sandy Dunes)', sample_name: 'test_4.jpg', hint: 'sandy' },
  { id: 'test_5', name: 'Sample 5 (Arctic Snow)', sample_name: 'test_5.jpg', hint: 'snowy' }
];
