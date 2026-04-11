"""
EquiScore Core Permissions & RBAC
=================================
FastAPI dependency factories defining Role-Based Access Control
and Hackathon isolation.
"""

from __future__ import annotations

import uuid
from typing import Callable, Coroutine, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import async_session_factory
from core.security import decode_token
from models.user import User, HackathonMembership

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# To support `get_current_user` inside `core/permissions.py` properly, we need AsyncSession.
# Since get_db from dependencies yields, we can inject it.
from core.dependencies import get_db

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Decodes JWT, fetches User from DB, checks is_active.
    Returns User object — usable on any authenticated route.
    """
    payload = decode_token(token)
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid subject format")

    user = await db.execute(
        select(User).where(User.id == user_uuid)
    )
    user = user.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")
        
    return user


def require_role(*roles: str) -> Callable:
    """
    Dependency factory to check user's membership role for the hackathon_id in the JWT.
    Usage: Depends(require_role("organizer", "superadmin"))
    """
    async def role_checker(
        token: str = Depends(oauth2_scheme),
        db: AsyncSession = Depends(get_db),
        user: User = Depends(get_current_user)
    ) -> User:
        if user.global_role == "superadmin":
            return user
            
        payload = decode_token(token)
        token_role = payload.get("role")
        
        # Superadmin override natively 
        if token_role == "superadmin":
            return user

        if not token_role or token_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Insufficient permissions"
            )
            
        return user
        
    return role_checker


def require_hackathon_scope() -> Callable:
    """
    Dependency to verify that the hackathon_id in the JWT matches the route's hackathon_id parameter.
    """
    async def scope_checker(
        hackathon_id: uuid.UUID,
        token: str = Depends(oauth2_scheme)
    ) -> uuid.UUID:
        payload = decode_token(token)
        
        # Superadmin bypass
        if payload.get("role") == "superadmin":
            return hackathon_id
            
        token_hackathon_id = payload.get("hackathon_id")
        if not token_hackathon_id or str(token_hackathon_id) != str(hackathon_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied: wrong hackathon scope"
            )
        return hackathon_id

    return scope_checker


async def get_current_hackathon_id(token: str = Depends(oauth2_scheme)) -> uuid.UUID:
    """
    Extracts hackathon_id from the session token.
    Throws 403 if missing (unless superadmin, which requires careful manual handling, 
    but generally data queries need a concrete hackathon_id).
    """
    payload = decode_token(token)
    token_hackathon_id = payload.get("hackathon_id")
    if not token_hackathon_id:
        raise HTTPException(status_code=403, detail="Route requires hackathon context. Please login scoped to a hackathon.")
    return uuid.UUID(str(token_hackathon_id))

