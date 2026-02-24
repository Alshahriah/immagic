from typing import List
from fastapi import APIRouter, Depends
from app.models.job import Job
from app.schemas.job import JobResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    return await Job.all().limit(limit).offset(offset).order_by("-created_at")
