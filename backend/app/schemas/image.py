from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class ImageBase(BaseModel):
    filename: str
    path: str
    width: Optional[int] = None
    height: Optional[int] = None

class ImageCreate(ImageBase):
    pass

class ImageResponse(ImageBase):
    id: int
    file_size: int
    mime_type: Optional[str] = None
    ocr_processed: bool
    ocr_text: Optional[str] = None
    thumbnail_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ImageSearch(BaseModel):
    query: str
    limit: int = 50
    offset: int = 0
