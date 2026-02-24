from PIL import Image
import os

def generate_thumbnail(image_path: str, output_path: str, size=(300, 300)):
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            img.save(output_path, "JPEG")
        return True
    except Exception as e:
        print(f"Error generating thumbnail for {image_path}: {e}")
        return False
