import os
import hashlib
from typing import List, Dict

def calculate_file_hash(filepath: str) -> str:
    """Calculate SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def scan_directory(directory: str) -> List[Dict]:
    """Recursively scan directory for images"""
    # Ensure absolute path to avoid CWD mismatch issues between worker/backend
    abs_directory = os.path.abspath(directory)
    
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'}
    found_files = []
    
    for root, _, files in os.walk(abs_directory):
        for file in files:
            if os.path.splitext(file)[1].lower() in image_extensions:
                full_path = os.path.join(root, file)
                try:
                    stats = os.stat(full_path)
                    found_files.append({
                        "path": full_path,
                        "filename": file,
                        "size": stats.st_size,
                        "created": stats.st_ctime
                    })
                except Exception as e:
                    print(f"Error accessing {full_path}: {e}")
                    
    return found_files
