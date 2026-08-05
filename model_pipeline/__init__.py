"""
TerrainVision AI Model Pipeline Package
Provides modular architecture for model loading, preprocessing, inference,
Grad-CAM explainability, and report generation.
"""

from .config import TERRAIN_CLASSES, CONFIDENCE_THRESHOLD, MODEL_VERSION, IMPLICIT_QUANTITIES
from .inference import TerrainPredictor

__all__ = [
    'TERRAIN_CLASSES',
    'CONFIDENCE_THRESHOLD',
    'MODEL_VERSION',
    'IMPLICIT_QUANTITIES',
    'TerrainPredictor'
]
