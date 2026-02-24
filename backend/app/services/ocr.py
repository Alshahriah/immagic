import pytesseract
from PIL import Image
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

def extract_text_from_image(image_path: str) -> str:
    try:
        text = pytesseract.image_to_string(Image.open(image_path))
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from {image_path}: {e}")
        return ""
