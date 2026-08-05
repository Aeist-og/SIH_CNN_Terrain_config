import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SAMPLES_DIR = os.path.join("static", "samples")
REPORTS_DIR = os.path.join("static", "reports")
os.makedirs(SAMPLES_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

def create_rocky_image(filepath):
    img = Image.new("RGB", (400, 400), "#4B4B4D")
    draw = ImageDraw.Draw(img)
    np.random.seed(42)
    for _ in range(300):
        x = np.random.randint(0, 400)
        y = np.random.randint(0, 400)
        r = np.random.randint(5, 30)
        color = (np.random.randint(60, 140), np.random.randint(60, 140), np.random.randint(60, 140))
        draw.ellipse([x-r, y-r, x+r, y+r], fill=color)
    img = img.filter(ImageFilter.GaussianBlur(1))
    img.save(filepath, "JPEG")
    print(f"Generated {filepath}")

def create_marshy_image(filepath):
    img = Image.new("RGB", (400, 400), "#2D3B26")
    draw = ImageDraw.Draw(img)
    np.random.seed(43)
    for _ in range(200):
        x = np.random.randint(0, 400)
        y = np.random.randint(0, 400)
        r = np.random.randint(10, 40)
        color = (np.random.randint(30, 80), np.random.randint(50, 100), np.random.randint(20, 60))
        draw.ellipse([x-r, y-r, x+r, y+r], fill=color)
    # Add water pools
    for _ in range(20):
        x = np.random.randint(50, 350)
        y = np.random.randint(50, 350)
        draw.ellipse([x-30, y-15, x+30, y+15], fill="#1E2F38")
    img.save(filepath, "JPEG")
    print(f"Generated {filepath}")

def create_grassy_image(filepath):
    img = Image.new("RGB", (400, 400), "#3E7B27")
    draw = ImageDraw.Draw(img)
    np.random.seed(44)
    for _ in range(500):
        x = np.random.randint(0, 400)
        y = np.random.randint(0, 400)
        color = (np.random.randint(30, 90), np.random.randint(110, 180), np.random.randint(20, 70))
        draw.line([x, y, x + np.random.randint(-5, 5), y - np.random.randint(5, 15)], fill=color, width=2)
    img.save(filepath, "JPEG")
    print(f"Generated {filepath}")

def create_sandy_image(filepath):
    img = Image.new("RGB", (400, 400), "#D2B48C")
    draw = ImageDraw.Draw(img)
    np.random.seed(45)
    for y in range(0, 400, 20):
        color = (np.random.randint(190, 225), np.random.randint(160, 190), np.random.randint(110, 140))
        draw.rectangle([0, y, 400, y+10], fill=color)
    img = img.filter(ImageFilter.GaussianBlur(3))
    img.save(filepath, "JPEG")
    print(f"Generated {filepath}")

def create_snowy_image(filepath):
    img = Image.new("RGB", (400, 400), "#E0E8EF")
    draw = ImageDraw.Draw(img)
    np.random.seed(46)
    for _ in range(300):
        x = np.random.randint(0, 400)
        y = np.random.randint(0, 400)
        r = np.random.randint(2, 10)
        color = (np.random.randint(220, 255), np.random.randint(230, 255), np.random.randint(240, 255))
        draw.ellipse([x-r, y-r, x+r, y+r], fill=color)
    img = img.filter(ImageFilter.GaussianBlur(1))
    img.save(filepath, "JPEG")
    print(f"Generated {filepath}")

if __name__ == '__main__':
    t1 = os.path.join(SAMPLES_DIR, "test_1.jpg")
    t2 = os.path.join(SAMPLES_DIR, "test_2.jpg")
    t3 = os.path.join(SAMPLES_DIR, "test_3.jpg")
    t4 = os.path.join(SAMPLES_DIR, "test_4.jpg")
    t5 = os.path.join(SAMPLES_DIR, "test_5.jpg")

    if not os.path.exists(t1): create_rocky_image(t1)
    if not os.path.exists(t2): create_marshy_image(t2)
    if not os.path.exists(t3): create_grassy_image(t3)
    if not os.path.exists(t4): create_sandy_image(t4)
    if not os.path.exists(t5): create_snowy_image(t5)

    print("All 5 terrain dataset sample images verified!")
