import asyncio
from tortoise import Tortoise, run_async
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings

async def create_user():
    await Tortoise.init(
        db_url=settings.DATABASE_URL,
        modules={"models": ["app.models"]}
    )
    
    username = "admin"
    password = "admin"
    
    # Check if user exists
    user = await User.get_or_none(username=username)
    if user:
        print(f"User '{username}' already exists.")
    else:
        await User.create(
            username=username,
            password_hash=get_password_hash(password),
            is_admin=True
        )
        print(f"User created successfully!")
        print(f"Username: {username}")
        print(f"Password: {password}")

    await Tortoise.close_connections()

if __name__ == "__main__":
    run_async(create_user())
