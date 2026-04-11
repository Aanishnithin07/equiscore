"""
EquiScore Invites Routes
========================
Endpoints for creating and redeeming hackathon invitations.
"""

import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from core.database import get_db
from core.permissions import require_role, get_current_user
from models.user import HackathonRole, User
from models.invite import InviteToken
from services.auth_service import generate_invite, redeem_invite

router = APIRouter(prefix="/invites", tags=["Invites"])


class GenerateInviteRequest(BaseModel):
    hackathon_id: uuid.UUID
    role: HackathonRole
    team_name: str | None = None


class RedeemInviteRequest(BaseModel):
    token: str
    team_name: str | None = None


@router.post("/generate", summary="Generate a hackathon invite token")
async def create_invite(
    payload: GenerateInviteRequest,
    db: AsyncSession = Depends(get_db),
    # We do require_role("organizer") dynamically via auth_service to ensure 
    # the user is an organizer specifically for payload.hackathon_id.
    user: User = Depends(get_current_user)
):
    """
    Creates an invite token. The generic get_current_user is used here
    because hackathon_id is in the body, not the path. auth_service validates ownership.
    """
    invite = await generate_invite(
        payload.hackathon_id, 
        payload.role, 
        payload.team_name, 
        user, 
        db
    )
    return {
        "invite_url": f"/join?token={invite.token}",
        "token": invite.token,
        "expires_at": invite.expires_at,
    }


@router.get("/{token}/preview", summary="Preview an invite token before redeeming")
async def preview_invite(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """View hackathon name and role by token without logging in."""
    from sqlalchemy import select
    from models.hackathon import Hackathon
    
    result = await db.execute(
        select(InviteToken, Hackathon)
        .join(Hackathon, InviteToken.hackathon_id == Hackathon.id)
        .where(InviteToken.token == token)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Invite token is invalid or expired.")
        
    invite, hackathon = row
    return {
        "hackathon_name": hackathon.name,
        "role": invite.role.value,
        "team_name": invite.team_name
    }

@router.post("/redeem", summary="Redeem a hackathon invite token")
async def consume_invite(
    payload: RedeemInviteRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Redeem a token to join a hackathon."""
    membership = await redeem_invite(payload.token, user.id, payload.team_name, db)
    return {
        "message": f"Successfully joined hackathon as {membership.role.value}",
        "hackathon_id": str(membership.hackathon_id),
        "role": membership.role.value
    }
