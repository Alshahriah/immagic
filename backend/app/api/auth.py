from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserResponse

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await User.get_or_none(username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=400, detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_in: UserCreate
) -> Any:
    """
    Create new user
    """
    user = await User.get_or_none(username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user_obj = await User.create(
        username=user_in.username,
        password_hash=security.get_password_hash(user_in.password)
    )
    # Basic response mapping
    return UserResponse(
        id=user_obj.id,
        username=user_obj.username,
        is_admin=user_obj.is_admin,
        created_at=str(user_obj.created_at)
    )
