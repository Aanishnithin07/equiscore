"""
EquiScore Authentication Service
================================
Implements business logic for JWT issuance, validation, and multi-tenant access.
"""

import secrets
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis

from core.config import settings
from core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password
)
from models.invite import InviteToken
from models.user import Hackathon, HackathonMembership, HackathonRole, User
from schemas.auth import RegisterRequest, TokenResponse


async def register_user(req: RegisterRequest, db: AsyncSession) -> User:
    """Register a new active user."""
    # Check email uniqueness
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def login_user(email: str, password: str, hackathon_slug: str | None, db: AsyncSession, redis: Redis) -> TokenResponse:
    """Authenticate and issue JWT scoped to a specific hackathon."""
    user_res = await db.execute(select(User).where(User.email == email))
    user = user_res.scalar_one_or_none()
    
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    hackathon_id = None
    role = "user"

    # If scoped to a hackathon, fetch membership
    if hackathon_slug:
        hack_res = await db.execute(select(Hackathon).where(Hackathon.slug == hackathon_slug))
        hack = hack_res.scalar_one_or_none()
        if not hack:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hackathon not found",
            )
            
        hackathon_id = str(hack.id)
        # Check membership
        mem_res = await db.execute(
            select(HackathonMembership)
            .where(HackathonMembership.user_id == user.id)
            .where(HackathonMembership.hackathon_id == hack.id)
        )
        mem = mem_res.scalar_one_or_none()
        if mem:
            role = mem.role.value
        elif user.global_role == "superadmin":
            role = "superadmin"
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is not a member of this hackathon",
            )

    access_token = create_access_token(str(user.id), role, hackathon_id)
    refresh_token = create_refresh_token(str(user.id))

    # Store refresh token hash in Redis
    await redis.setex(
        f"refresh:{user.id}",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        hash_password(refresh_token)
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


async def refresh_tokens(refresh_token: str, db: AsyncSession, redis: Redis) -> TokenResponse:
    """Exchange a valid refresh token for a new access+refresh pair."""
    payload = decode_token(refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid subject")

    stored_hash = await redis.get(f"refresh:{user_id}")
    if not stored_hash or not verify_password(refresh_token, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reuse or invalid invalidity detected",
        )

    # Issue minimal scoped access token (user forced to re-login for hackathon scoped access)
    # Alternatively we can extract role/hackathon from existing... but typically refresh drops scope context.
    # We will issue a generic user scope. 
    access_token = create_access_token(user_id, "user", None)
    new_refresh = create_refresh_token(user_id)

    # Rotate in Redis
    await redis.setex(
        f"refresh:{user_id}",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        hash_password(new_refresh)
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


async def logout(user_id: str, redis: Redis) -> None:
    """Invalidate a user's remote refresh token."""
    await redis.delete(f"refresh:{user_id}")


async def generate_invite(
    hackathon_id: uuid.UUID,
    role: HackathonRole,
    team_name: str | None,
    created_by: User,
    db: AsyncSession
) -> InviteToken:
    """Generate a single-use invite token string."""
    mem_res = await db.execute(
        select(HackathonMembership)
        .where(HackathonMembership.user_id == created_by.id)
        .where(HackathonMembership.hackathon_id == hackathon_id)
        .where(HackathonMembership.role == HackathonRole.ORGANIZER)
    )
    
    if not mem_res.scalar_one_or_none() and created_by.global_role != "superadmin":
        raise HTTPException(status_code=403, detail="Only organizers can invite users")

    raw_token = secrets.token_hex(32)
    invite = InviteToken(
        token=raw_token,
        hackathon_id=hackathon_id,
        intended_role=role,
        intended_team_name=team_name,
        created_by=created_by.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(invite)
    await db.commit()
    await db.refresh(invite)
    return invite


async def redeem_invite(
    token_str: str,
    user_id: uuid.UUID,
    chosen_team_name: str | None,
    db: AsyncSession
) -> HackathonMembership:
    """Consume an invite token and register the user into the hackathon scope."""
    res = await db.execute(select(InviteToken).where(InviteToken.token == token_str))
    invite = res.scalar_one_or_none()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Invite token not found")

    if invite.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invite token expired")

    if invite.is_single_use and invite.redeemed_at is not None:
        raise HTTPException(status_code=400, detail="Invite already redeemed")

    hack_res = await db.execute(select(Hackathon).where(Hackathon.id == invite.hackathon_id))
    hack = hack_res.scalar_one_or_none()
    
    if not hack or hack.status != "registration_open":
        raise HTTPException(status_code=400, detail="Hackathon registration is closed")

    # Double check if user is already a member
    mem_exist_res = await db.execute(
        select(HackathonMembership)
        .where(HackathonMembership.user_id == user_id)
        .where(HackathonMembership.hackathon_id == hack.id)
    )
    if mem_exist_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already in this hackathon")

    # Map the team
    team_name = invite.intended_team_name or chosen_team_name
    if invite.intended_role == HackathonRole.TEAM_MEMBER and not team_name:
        raise HTTPException(status_code=400, detail="Team member role requires a team name")

    membership = HackathonMembership(
        user_id=user_id,
        hackathon_id=hack.id,
        role=invite.intended_role,
        team_name=team_name,
    )
    
    if invite.is_single_use:
        invite.redeemed_by = user_id
        invite.redeemed_at = datetime.now(timezone.utc)

    db.add(membership)
    await db.commit()
    await db.refresh(membership)
    
    return membership
