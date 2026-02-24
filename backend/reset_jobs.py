import asyncio
from tortoise import Tortoise, run_async
from app.models.job import Job
from app.core.config import settings

async def reset_jobs():
    await Tortoise.init(
        db_url=settings.DATABASE_URL,
        modules={"models": ["app.models"]}
    )
    
    print("Deleting all jobs...")
    count = await Job.all().delete()
    print(f"Deleted {count} jobs.")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(reset_jobs())
