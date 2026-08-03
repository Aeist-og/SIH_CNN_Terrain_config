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

export const DEFAULT_IMPLICIT_QUANTITIES = {
  grassy: {
    roughness: {
      qualitative: 'Low',
      value_ra: 0.25,
      score: 25,
      description: 'Smooth, uniform vegetation cover with minor surface height variance.'
    },
    slipperiness: {
      qualitative: 'Moderate',
      friction_coefficient: 0.55,
      score: 45,
      description: 'Moderate tire/footing grip; reduced when wet or dew covered.'
    },
    treacherousness: {
      qualitative: 'Low',
      hazard_level: 1,
      score: 15,
      description: 'Optimal pathing condition for autonomous rovers and field transport.'
    },
    vegetation: {
      density_pct: 85,
      qualitative: 'High'
    },
    hydration: {
      moisture_pct: 35,
      qualitative: 'Moderate'
    },
    surface_stability: {
      status: 'Stable / High Shear',
      bearing_capacity_kpa: 180,
      score: 88
    },
    perception_telemetry: {
      traversal_safety_index: 92,
      recommended_max_speed_kmh: 45,
      wheel_grip_index: 85,
      recommended_drive_mode: 'Normal / Standard 2WD'
    }
  },
  marshy: {
    roughness: {
      qualitative: 'Moderate',
      value_ra: 0.48,
      score: 50,
      description: 'Uneven soft ground, water channels, and mud pools.'
    },
    slipperiness: {
      qualitative: 'High',
      friction_coefficient: 0.22,
      score: 85,
      description: 'Low dynamic friction coefficient; high risk of wheel slip.'
    },
    treacherousness: {
      qualitative: 'High',
      hazard_level: 4,
      score: 80,
      description: 'High risk of vehicle sinkage, bogging, and loss of directional control.'
    },
    vegetation: {
      density_pct: 45,
      qualitative: 'Moderate'
    },
    hydration: {
      moisture_pct: 92,
      qualitative: 'Very High'
    },
    surface_stability: {
      status: 'Unstable / Deformable',
      bearing_capacity_kpa: 45,
      score: 25
    },
    perception_telemetry: {
      traversal_safety_index: 38,
      recommended_max_speed_kmh: 12,
      wheel_grip_index: 30,
      recommended_drive_mode: '4WD Low / Mud & Ruts Protocol'
    }
  },
  rocky: {
    roughness: {
      qualitative: 'High',
      value_ra: 0.88,
      score: 90,
      description: 'Extreme spatial irregularity with sharp stones and loose boulders.'
    },
    slipperiness: {
      qualitative: 'Low',
      friction_coefficient: 0.75,
      score: 20,
      description: 'High dry mechanical interlock and rigid surface contact.'
    },
    treacherousness: {
      qualitative: 'Moderate',
      hazard_level: 3,
      score: 60,
      description: 'Chassis underside impact hazard, puncture risk, and suspension stress.'
    },
    vegetation: {
      density_pct: 10,
      qualitative: 'Low'
    },
    hydration: {
      moisture_pct: 12,
      qualitative: 'Low'
    },
    surface_stability: {
      status: 'Stable Bedrock',
      bearing_capacity_kpa: 350,
      score: 95
    },
    perception_telemetry: {
      traversal_safety_index: 74,
      recommended_max_speed_kmh: 18,
      wheel_grip_index: 78,
      recommended_drive_mode: '4WD Low / Rock Crawl Mode'
    }
  },
  sandy: {
    roughness: {
      qualitative: 'Moderate',
      value_ra: 0.42,
      score: 45,
      description: 'Granular particulate layer with loose micro-dunes and ripples.'
    },
    slipperiness: {
      qualitative: 'Moderate',
      friction_coefficient: 0.45,
      score: 55,
      description: 'Particle shear under wheel torque causing localized slipping.'
    },
    treacherousness: {
      qualitative: 'Low - Moderate',
      hazard_level: 2,
      score: 35,
      description: 'Moderate bogging risk if momentum drops on incline slopes.'
    },
    vegetation: {
      density_pct: 5,
      qualitative: 'Very Low'
    },
    hydration: {
      moisture_pct: 8,
      qualitative: 'Very Low'
    },
    surface_stability: {
      status: 'Loose / Granular',
      bearing_capacity_kpa: 95,
      score: 55
    },
    perception_telemetry: {
      traversal_safety_index: 81,
      recommended_max_speed_kmh: 30,
      wheel_grip_index: 62,
      recommended_drive_mode: 'Sand Mode / Deflated Pressure'
    }
  },
  snowy: {
    roughness: {
      qualitative: 'High',
      value_ra: 0.65,
      score: 70,
      description: 'Snow drifts, icy crusts, and sub-zero compact pack.'
    },
    slipperiness: {
      qualitative: 'High',
      friction_coefficient: 0.18,
      score: 90,
      description: 'Ice boundary lubrication. Minimal dynamic friction coefficient.'
    },
    treacherousness: {
      qualitative: 'High',
      hazard_level: 4,
      score: 82,
      description: 'Extreme skid risk, lateral sliding, and braking distance expansion.'
    },
    vegetation: {
      density_pct: 5,
      qualitative: 'Very Low'
    },
    hydration: {
      moisture_pct: 60,
      qualitative: 'High (Frozen)'
    },
    surface_stability: {
      status: 'Variable / Slippery',
      bearing_capacity_kpa: 60,
      score: 35
    },
    perception_telemetry: {
      traversal_safety_index: 42,
      recommended_max_speed_kmh: 15,
      wheel_grip_index: 25,
      recommended_drive_mode: 'Snow & Ice Lock / Chain Assist'
    }
  }
};

export const SAMPLE_IMAGES = [
  { id: 'test_1', name: 'Sample 1 (Rocky Slope)', sample_name: 'test_1.jpg', hint: 'rocky' },
  { id: 'test_2', name: 'Sample 2 (Marshy Land)', sample_name: 'test_2.jpg', hint: 'marshy' },
  { id: 'test_3', name: 'Sample 3 (Grassy Field)', sample_name: 'test_3.jpg', hint: 'grassy' },
  { id: 'test_4', name: 'Sample 4 (Sandy Dunes)', sample_name: 'test_4.jpg', hint: 'sandy' }
];
