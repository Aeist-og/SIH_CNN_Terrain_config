import qrcode
import os

EXPO_URL = "exp://10.154.200.222:8081"
ARTIFACT_DIR = r"C:\Users\Asus\.gemini\antigravity-ide\brain\20d0b0b4-43b8-40dd-b38c-e917c1b67fac"
OUTPUT_PATH = os.path.join(ARTIFACT_DIR, "expo_qr_code.png")

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data(EXPO_URL)
qr.make(fit=True)

img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
img.save(OUTPUT_PATH)

print(f"QR code successfully generated and saved to {OUTPUT_PATH}")
print(f"Target Expo URL: {EXPO_URL}")
