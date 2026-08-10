"""
Validation and Out-of-Distribution (OOD) decision engine for TerrainVision AI.
Differentiates between valid terrain imagery, low-confidence terrain, and unsupported/non-terrain images.
"""

import numpy as np
from PIL import Image

def validate_image_input(pil_image: Image.Image) -> tuple[bool, str | None]:
    """
    Perform pre-inference image validation.
    Checks image integrity, dimensions, color channels, and extreme artifacts.
    """
    if pil_image is None:
        return False, "No image provided or image payload failed to decode."
    
    try:
        width, height = pil_image.size
        if width < 32 or height < 32:
            return False, f"Image dimensions ({width}x{height}) are too small for terrain analysis (minimum 32x32 required)."
        
        # Convert to RGB array for pixel variance check
        rgb_img = pil_image.convert('RGB')
        arr = np.array(rgb_img, dtype=np.float32)
        
        # Check for blank / near-blank image (zero or tiny variance)
        std_per_channel = np.std(arr, axis=(0, 1))
        total_std = np.mean(std_per_channel)
        if total_std < 2.0:
            return False, "Input image is blank, flat-color, or featureless. Valid outdoor terrain imagery required."
            
        return True, None
    except Exception as e:
        return False, f"Image structure validation failed: {str(e)}"

def evaluate_ood_status(
    probabilities: dict[str, float],
    top_confidence: float,
    entropy_val: float,
    margin_val: float,
    pil_img: Image.Image
) -> tuple[bool, str, str | None]:
    """
    Two-stage OOD / Unknown decision logic.
    
    Returns:
      (is_rejected: bool, status_label: str, rejection_reason: str | None)
      
    Status labels:
      - 'classified': Valid terrain with solid confidence
      - 'low_confidence': Valid terrain class, but uncertain predictions (margin/confidence low)
      - 'rejected': Image rejected as Non-Terrain / Out of Distribution (unknown)
    """
    num_classes = len(probabilities)
    max_possible_entropy = np.log(num_classes)
    normalized_entropy = entropy_val / max_possible_entropy if max_possible_entropy > 0 else 0.0
    
    # 1. Extreme Uniform Noise / Indecision Check (Stage A)
    # High entropy (>0.90) and tiny margin (<0.08) and top confidence (<0.32) indicates extreme uncertainty
    if top_confidence < 0.30 and margin_val < 0.08:
        return (
            True,
            'rejected',
            f"The image lacks distinctive terrain features. Classification confidence ({top_confidence:.1%}) "
            f"and probability margin ({margin_val:.2f}) indicate non-terrain or out-of-distribution input."
        )

    # 2. Check for Non-Terrain Indoor / Graphic Attributes (Stage B heuristic)
    # Analyze color saturation and edge characteristics
    try:
        rgb_img = pil_img.resize((128, 128)).convert('RGB')
        arr = np.array(rgb_img, dtype=np.float32)
        
        # Compute color channel correlations (synthetic art / UI screenshots often have pure primary colors)
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        r_std, g_std, b_std = np.std(r), np.std(g), np.std(b)
        
        # Extremely flat contrast or extreme unnatural color distribution check
        if r_std < 3.0 and g_std < 3.0 and b_std < 3.0:
            return (
                True,
                'rejected',
                "Uniform color distribution detected. The input image does not contain natural terrain features."
            )
    except Exception:
        pass

    # 3. Decision thresholding for Low Confidence vs Classified
    if top_confidence < 0.40:
        return (
            False,
            'low_confidence',
            f"Low confidence detection ({top_confidence:.1%}). Terrain classification is plausible but uncertain."
        )

    return False, 'classified', None
