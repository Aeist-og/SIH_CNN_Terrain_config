import os
from PIL import Image, ImageDraw

assets_dir = r"d:\Antigravity\SIH\Terrain_Recognition_Using_CNN\mobile_app\assets"
os.makedirs(assets_dir, exist_ok=True)

# Generate icon.png (1024x1024)
icon = Image.new("RGB", (1024, 1024), color="#0f172a")
d = ImageDraw.Draw(icon)
d.rounded_rectangle([256, 256, 768, 768], radius=100, fill="#2563eb")
icon.save(os.path.join(assets_dir, "icon.png"))

# Generate splash.png (1242x2436)
splash = Image.new("RGB", (1242, 2436), color="#0f172a")
d_splash = ImageDraw.Draw(splash)
d_splash.rounded_rectangle([421, 1018, 821, 1418], radius=80, fill="#2563eb")
splash.save(os.path.join(assets_dir, "splash.png"))

# Generate adaptive-icon.png (1024x1024)
adaptive = Image.new("RGBA", (1024, 1024), color=(0, 0, 0, 0))
d_adaptive = ImageDraw.Draw(adaptive)
d_adaptive.rounded_rectangle([256, 256, 768, 768], radius=100, fill="#2563eb")
adaptive.save(os.path.join(assets_dir, "adaptive-icon.png"))

# Generate favicon.png (48x48)
favicon = Image.new("RGB", (48, 48), color="#2563eb")
favicon.save(os.path.join(assets_dir, "favicon.png"))

print("Expo assets generated successfully in mobile_app/assets!")
