from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class JobResponse(BaseModel):
    id: int
    job_id: str
    type: str
    status: str
    result: Optional[str] = None
    target_path: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
