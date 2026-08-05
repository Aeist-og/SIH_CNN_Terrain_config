import os

MODEL_PATH = os.path.join("model", "terrain_recognition_model.h5")
SAMPLES_DIR = os.path.join("static", "samples")

TARGET_SIZE = (224, 224)
CONFIDENCE_THRESHOLD = 0.50
MODEL_VERSION = "terrain-cnn-v1.2.0"

TERRAIN_CLASSES = ['grassy', 'marshy', 'rocky', 'sandy', 'snowy']

IMPLICIT_QUANTITIES = {
    'grassy': {
        'roughness': {
            'qualitative': 'Low',
            'value_ra': 0.25,
            'score': 25,
            'description': 'Smooth surface with minor micro-textural variations.'
        },
        'slipperiness': {
            'qualitative': 'Moderate',
            'friction_coefficient': 0.55,
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
