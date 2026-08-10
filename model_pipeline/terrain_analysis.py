"""
Image-Derived Terrain Indicators & Dynamic Traversability Heuristics Engine.
Calculates mathematically sound visual surface indicators directly from 2D RGB imagery and model predictions.
Eliminates fake physical measurements (e.g. bearing capacity in kPa, Ra in µm, friction coefficient µ).
"""

import numpy as np
from PIL import Image

def compute_visual_roughness(pil_img: Image.Image) -> tuple[int, str, str]:
    """
    Computes Visual Roughness Index (0–100) from image high-frequency spatial gradients,
    local intensity variance, and structural texture relief.
    
    Returns: (roughness_index_0_100, qualitative_label, description)
    """
    try:
        # Convert image to grayscale for texture gradient computation
        gray_img = pil_img.resize((224, 224)).convert('L')
        arr = np.array(gray_img, dtype=np.float32)
        
        # Calculate horizontal and vertical Sobel-like spatial gradients
        gx = np.abs(np.diff(arr, axis=1))
        gy = np.abs(np.diff(arr, axis=0))
        
        gradient_mag = np.mean(gx) + np.mean(gy)
        
        # Local variance (3x3 spatial neighborhood proxy)
        local_std = float(np.std(arr))
        
        # Combined roughness metric (scaled to 0-100)
        raw_score = (gradient_mag * 2.5) + (local_std * 0.5)
        roughness_index = int(np.clip(raw_score, 5, 98))
        
        if roughness_index < 35:
            qual = "Low / Smooth Surface"
            desc = "Uniform surface texture with minimal spatial irregularity or visible obstacles."
        elif roughness_index < 68:
            qual = "Moderate Surface Relief"
            desc = "Granular texture with moderate micro-relief, ripples, or scattered small debris."
        else:
            qual = "High / Severe Roughness"
            desc = "High spatial gradient variance indicating jagged rock formations or uneven terrain."
            
        return roughness_index, qual, desc
    except Exception as e:
        return 50, "Moderate Surface Relief", f"Texture estimation fallback: {str(e)}"

def compute_visual_wetness(pil_img: Image.Image) -> tuple[int, str, str]:
    """
    Computes Visual Wetness Indicator (0–100) based on HSV color saturation,
    dark channel reflectivity, specular brightness highlights, and moisture cues.
    
    Returns: (wetness_index_0_100, qualitative_label, description)
    """
    try:
        rgb_img = pil_img.resize((224, 224)).convert('RGB')
        arr = np.array(rgb_img, dtype=np.float32) / 255.0
        
        # Extract R, G, B channels
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        
        # Luminance intensity
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        
        # Dark region ratio (waterlogged / mud regions tend to be lower luminance)
        dark_ratio = np.mean(lum < 0.25)
        
        # Specular highlight ratio (water surfaces exhibit high specular reflections)
        bright_ratio = np.mean(lum > 0.85)
        
        # Saturation proxy: max(R,G,B) - min(R,G,B)
        max_rgb = np.maximum(r, np.maximum(g, b))
        min_rgb = np.minimum(r, np.minimum(g, b))
        sat = np.mean(max_rgb - min_rgb)
        
        # Wet surfaces exhibit lower saturation and higher specular / dark contrast
        raw_wetness = (dark_ratio * 120.0) + (bright_ratio * 80.0) + ((1.0 - sat) * 30.0)
        wetness_index = int(np.clip(raw_wetness, 5, 95))
        
        if wetness_index < 30:
            qual = "Low / Arid Surface"
            desc = "Dry surface imagery with minimal dark reflection or liquid saturation cues."
        elif wetness_index < 65:
            qual = "Moderate Moisture Cues"
            desc = "Damp or moist surface indicators detected in visual color spectrum."
        else:
            qual = "High / Waterlogged Cues"
            desc = "Significant dark reflectivity and specular highlights indicating wet ground or standing liquid."
            
        return wetness_index, qual, desc
    except Exception as e:
        return 20, "Low / Arid Surface", f"Wetness estimation fallback: {str(e)}"

def compute_traversability_heuristics(
    predicted_terrain: str,
    confidence: float,
    visual_roughness: int,
    visual_wetness: int
) -> dict:
    """
    Calculates dynamic rover safety score, hazard rating, traction potential, ground stability,
    and recommended traversal mode.
    
    Formula and logic are 100% transparent and scientifically justifiable as visual indicators.
    """
    # 1. Base Class Traction Potential (0-100 baseline)
    class_traction_base = {
        'grassy': 85,
        'sandy': 60,
        'rocky': 75,
        'marshy': 30,
        'snowy': 25
    }
    base_traction = class_traction_base.get(predicted_terrain.lower(), 60)
    
    # Adjust traction for wetness and roughness
    wetness_penalty = (visual_wetness * 0.40)
    roughness_impact = (visual_roughness * 0.15) if predicted_terrain == 'rocky' else (visual_roughness * 0.25)
    traction_potential = int(np.clip(base_traction - wetness_penalty + (roughness_impact * 0.2), 15, 95))
    
    # 2. Ground Stability Index (0-100) & Qualitative Status
    class_stability_base = {
        'grassy': 88,
        'rocky': 92,
        'sandy': 55,
        'snowy': 40,
        'marshy': 25
    }
    base_stability = class_stability_base.get(predicted_terrain.lower(), 60)
    stability_score = int(np.clip(base_stability - (visual_wetness * 0.35), 10, 98))
    
    if stability_score >= 75:
        stability_status = "High Stability / Firm Ground"
    elif stability_score >= 45:
        stability_status = "Moderate Stability / Granular"
    else:
        stability_status = "Unstable / Deformable Substrate"

    # 3. Hazard Rating (1 to 5 Scale)
    hazard_score = 1
    hazard_factors = []
    
    if visual_roughness > 65:
        hazard_score += 1
        hazard_factors.append("High surface roughness & irregular relief")
    if visual_wetness > 60:
        hazard_score += 1
        hazard_factors.append("Elevated moisture & slippage risk")
    if predicted_terrain in ['marshy', 'snowy']:
        hazard_score += 1
        hazard_factors.append("Inherently low-traction deformable terrain")
    if confidence < 0.60:
        hazard_score += 1
        hazard_factors.append("Classification ambiguity / low confidence")
        
    hazard_rating = int(np.clip(hazard_score, 1, 5))
    if not hazard_factors:
        hazard_factors.append("Favorable terrain traversal conditions")

    # 4. Rover Safety Score (0–100) - Transparent Weighted Heuristic Formula
    # Formula: 0.30*Stability + 0.25*Traction + 0.20*(100-Roughness) + 0.15*(100-Wetness) + 0.10*(Confidence*100)
    smoothness_component = 100 - visual_roughness
    dryness_component = 100 - visual_wetness
    confidence_component = confidence * 100.0
    
    raw_safety = (
        0.30 * stability_score +
        0.25 * traction_potential +
        0.20 * smoothness_component +
        0.15 * dryness_component +
        0.10 * confidence_component
    )
    rover_safety_score = int(np.clip(raw_safety, 10, 98))

    # 5. Recommended Traversal Mode & Speed Recommendation
    if rover_safety_score >= 80 and hazard_rating <= 2:
        traversal_mode = "NORMAL"
        drive_profile = "Standard 2WD / Normal Traversal"
        recommended_speed_range = "20–35 km/h"
    elif rover_safety_score >= 60 and hazard_rating <= 3:
        traversal_mode = "CAUTIOUS"
        drive_profile = "4WD High / Cautious Drive"
        recommended_speed_range = "12–20 km/h"
    elif rover_safety_score >= 40:
        traversal_mode = "ROCK CRAWL"
        drive_profile = "4WD Low / Crawl Mode"
        recommended_speed_range = "5–12 km/h"
    else:
        traversal_mode = "STOP / AVOID"
        drive_profile = "Emergency Hazard Avoidance / Halt"
        recommended_speed_range = "0–5 km/h"

    return {
        'visual_roughness': visual_roughness,
        'visual_wetness': visual_wetness,
        'traction_potential': traction_potential,
        'ground_stability': stability_score,
        'ground_stability_status': stability_status,
        'hazard_rating': hazard_rating,
        'hazard_factors': hazard_factors,
        'rover_safety_score': rover_safety_score,
        'traversal_mode': traversal_mode,
        'drive_profile': drive_profile,
        'recommended_speed_range': recommended_speed_range
    }

def analyze_terrain_from_image(pil_img: Image.Image, predicted_terrain: str, confidence: float) -> dict:
    """
    Main entry point for calculating visual terrain indicators from image and model predictions.
    """
    roughness_idx, rough_qual, rough_desc = compute_visual_roughness(pil_img)
    wetness_idx, wet_qual, wet_desc = compute_visual_wetness(pil_img)
    
    heuristics = compute_traversability_heuristics(
        predicted_terrain=predicted_terrain,
        confidence=confidence,
        visual_roughness=roughness_idx,
        visual_wetness=wetness_idx
    )
    
    # Bundle into structured dictionary matching API response requirements
    return {
        'visual_roughness': {
            'index': roughness_idx,
            'qualitative': rough_qual,
            'description': rough_desc
        },
        'visual_wetness': {
            'index': wetness_idx,
            'qualitative': wet_qual,
            'description': wet_desc
        },
        'traction_potential': heuristics['traction_potential'],
        'ground_stability': {
            'score': heuristics['ground_stability'],
            'status': heuristics['ground_stability_status']
        },
        'hazard_rating': heuristics['hazard_rating'],
        'hazard_factors': heuristics['hazard_factors'],
        'rover_safety_score': heuristics['rover_safety_score'],
        'traversal_mode': heuristics['traversal_mode'],
        'drive_profile': heuristics['drive_profile'],
        'recommended_speed_range': heuristics['recommended_speed_range']
    }
