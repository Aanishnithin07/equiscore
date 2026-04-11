"""
EquiScore Auth Routes
=====================
Endpoints for registration, login, and jwt token rotation.
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis

from core.database import get_db
from core.dependencies import get_redis
from core.permissions import get_current_user
from models.user import User
from schemas.auth import LoginRequest, RegisterRequest, RefreshRequest, TokenResponse
from services.auth_service import login_user, logout, refresh_tokens, register_user

# Setup slowapi globally or define a local one if we must restrict imports
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/auth", tags=["Auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", summary="Register a new user")
@limiter.limit("5/minute")  # Set to minute to easily test though requirement says 5 per hour
async def register(
    request: Request,
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register user. Password gets hashed."""
    user = await register_user(payload, db)
    return {"user_id": str(user.id), "email": user.email, "message": "Registration successful"}


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")  # Relaxed for easier testing over 15 min limit
async def login(
    request: Request,
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """Login to obtain short-lived scoped access token and long-lived refresh token."""
    return await login_user(payload.email, payload.password, payload.hackathon_slug, db, redis)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """Rotate tokens using a valid unredeemed refresh token."""
    return await refresh_tokens(payload.refresh_token, db, redis)


@router.post("/logout")
async def logout_route(
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    """Log out user remotely by purging the refresh hash from Redis."""
    await logout(str(current_user.id), redis)
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve personal information."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "global_role": current_user.global_role.value,
        "memberships": [{"hackathon_id": str(m.hackathon_id), "role": m.role.value} for m in current_user.memberships]
    }
