from pydantic import BaseModel
from datetime import datetime

class ScanPathBase(BaseModel):
    path: str

class ScanPathCreate(ScanPathBase):
    pass

class ScanPathResponse(ScanPathBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
