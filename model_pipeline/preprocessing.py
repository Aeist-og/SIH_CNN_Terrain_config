import io
import base64
import numpy as np
from PIL import Image
from tensorflow.keras.preprocessing.image import img_to_array # type: ignore
from .config import TARGET_SIZE

def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    """Load PIL Image from raw bytes safely."""
    img = Image.open(io.BytesIO(image_bytes))
    return img.convert('RGB')

def decode_base64_image(b64_str: str) -> Image.Image:
    """Decode base64 string (with optional data prefix) to PIL Image safely."""
    try:
        if ',' in b64_str:
            b64_str = b64_str.split(',')[1]
        image_bytes = base64.b64decode(b64_str.strip())
        return load_image_from_bytes(image_bytes)
    except Exception as e:
        raise ValueError(f"Invalid or corrupted base64 image data payload: {e}")

def preprocess_for_inference(pil_img: Image.Image) -> np.ndarray:
    """Preprocess PIL image into (1, 224, 224, 3) normalized float array [0, 1]."""
    img = pil_img.resize(TARGET_SIZE).convert('RGB')
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array
