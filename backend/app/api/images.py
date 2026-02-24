from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from app.models.image import Image
from app.schemas.image import ImageResponse, ImageSearch
from app.api.deps import get_current_user
from app.models.user import User
from tortoise.expressions import Q
from app.tasks import scan_directory_task, process_pending_ocr_task
import os

router = APIRouter()

@router.post("/scan")
async def scan_folder(
    path: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    """Trigger a recursive scan of a directory."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can scan folders")
        
    task = scan_directory_task.delay(path)
    return {"message": "Scan started", "task_id": str(task.id)}

@router.post("/process-ocr")
async def process_ocr(
    current_user: User = Depends(get_current_user)
):
    """Trigger OCR for all pending images."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can trigger OCR")
        
    task = process_pending_ocr_task.delay()
    return {"message": "OCR batch processing started", "task_id": str(task.id)}

@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user)
):
    total = await Image.all().count()
    pending = await Image.filter(ocr_processed=False).count()
    return {"total_images": total, "pending_ocr": pending}

@router.get("/{image_id}/file")
async def get_image_file(
    image_id: int,
    current_user: User = Depends(get_current_user)
):
    """Serve the actual image file."""
    image = await Image.get_or_none(id=image_id)
    if not image:
        print(f"DEBUG: Image ID {image_id} not found in DB")
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Debug print to see what path is being accessed
    print(f"DEBUG: Requesting file: {image.path}")
    print(f"DEBUG: Exists? {os.path.exists(image.path)}")
    
    if not os.path.exists(image.path):
        print(f"ERROR: File missing on disk: {image.path}")
        raise HTTPException(status_code=404, detail=f"File not found on disk: {image.path}")
        
    return FileResponse(image.path)

@router.get("/", response_model=List[ImageResponse])
async def get_images(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    return await Image.all().limit(limit).offset(offset).order_by("-created_at")

@router.get("/{image_id}", response_model=ImageResponse)
async def get_image(
    image_id: int,
    current_user: User = Depends(get_current_user)
):
    image = await Image.get_or_none(id=image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@router.get("/search/", response_model=List[ImageResponse])
async def search_images(
    q: str,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    # Full text search on ocr_text or filename
    # Tortoise simple filter for now. Ideally use Postgres TSVECTOR.
    return await Image.filter(
        Q(ocr_text__icontains=q) | Q(filename__icontains=q)
    ).limit(limit).offset(offset)
