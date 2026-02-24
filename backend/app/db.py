from fastapi import FastAPI
from tortoise import Tortoise
from app.core.config import settings

TORTOISE_ORM = {
    "connections": {"default": settings.DATABASE_URL},
    "apps": {
        "models": {
            "models": ["app.models", "aerich.models"],
            "default_connection": "default",
        },
    },
}

async def init_db() -> None:
    await Tortoise.init(config=TORTOISE_ORM)
    # Generate schemas is only for dev/testing. 
    # In production, use Aerich migrations.
    # For this simplified setup, we'll keep it to auto-create tables if they don't exist.
    await Tortoise.generate_schemas()

async def close_db() -> None:
    await Tortoise.close_connections()
