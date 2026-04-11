"""
EquiScore Hackathon Routes
==========================
CRUD operations and state management for multi-tenant hackathons.
"""

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from core.database import get_db
from core.permissions import get_current_user, require_role, require_hackathon_scope
from core.security import create_access_token
from models.user import Hackathon, HackathonMembership, HackathonRole, HackathonStatus, User
from schemas.hackathon import HackathonCreate, HackathonResponse, HackathonUpdate

router = APIRouter(prefix="/hackathons", tags=["Hackathons"])

STATUS_ORDER = {
    HackathonStatus.DRAFT: 0,
    HackathonStatus.REGISTRATION_OPEN: 1,
    HackathonStatus.SUBMISSION_CLOSED: 2,
    HackathonStatus.JUDGING: 3,
    HackathonStatus.RESULTS_PUBLISHED: 4,
}


@router.post("/", summary="Create a new hackathon")
async def create_hackathon(
    payload: HackathonCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new hackathon and automatically sets the creator as ORGANIZER.
    """
    slug = payload.name.lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:8]
    
    hackathon = Hackathon(
        name=payload.name,
        slug=slug,
        description=payload.description,
        owner_id=user.id,
        submission_deadline=payload.submission_deadline,
        tracks_enabled=payload.tracks_enabled,
        max_team_size=payload.max_team_size,
    )
    db.add(hackathon)
    await db.commit()
    await db.refresh(hackathon)

    membership = HackathonMembership(
        user_id=user.id,
        hackathon_id=hackathon.id,
        role=HackathonRole.ORGANIZER
    )
    db.add(membership)
    await db.commit()
    
    access_token = create_access_token(str(user.id), HackathonRole.ORGANIZER.value, str(hackathon.id))

    return {
        "hackathon": HackathonResponse.model_validate(hackathon),
        "access_token": access_token
    }


@router.get("/my", summary="List user hackathons")
async def get_my_hackathons(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all hackathons the current authenticated user belongs to."""
    res = await db.execute(
        select(HackathonMembership)
        .where(HackathonMembership.user_id == user.id)
    )
    memberships = res.scalars().all()
    
    # We could join this, but lazy matching or explicit loads work best
    # Assuming Hackathon is relationship loaded, we just output it.
    output = []
    for mem in memberships:
        hack_res = await db.execute(select(Hackathon).where(Hackathon.id == mem.hackathon_id))
        hack = hack_res.scalar_one()
        output.append({
            "role": mem.role.value,
            "team_name": mem.team_name,
            "hackathon": HackathonResponse.model_validate(hack)
        })
    return output


@router.get("/{hackathon_id}", response_model=HackathonResponse)
async def get_hackathon(
    hackathon_id: uuid.UUID,
    scope: uuid.UUID = Depends(require_hackathon_scope()),
    db: AsyncSession = Depends(get_db)
):
    """Get full hackathon details. Scoped correctly."""
    hack = await db.execute(select(Hackathon).where(Hackathon.id == hackathon_id))
    hack_obj = hack.scalar_one_or_none()
    if not hack_obj:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    return hack_obj


@router.patch("/{hackathon_id}", response_model=HackathonResponse)
async def update_hackathon(
    hackathon_id: uuid.UUID,
    payload: HackathonUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("organizer")),
    scope: uuid.UUID = Depends(require_hackathon_scope())
):
    """Update hackathon state. Organizer only."""
    hack = await db.execute(select(Hackathon).where(Hackathon.id == hackathon_id))
    hack_obj = hack.scalar_one_or_none()
    if not hack_obj:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    if payload.status:
        # Validate forward transition
        current_rank = STATUS_ORDER.get(hack_obj.status, -1)
        new_rank = STATUS_ORDER.get(payload.status, -1)
        if new_rank < current_rank:
            raise HTTPException(status_code=422, detail="Invalid backward status transition")
        hack_obj.status = payload.status

    if payload.name is not None:
        hack_obj.name = payload.name
    if payload.description is not None:
        hack_obj.description = payload.description
    if payload.submission_deadline is not None:
        hack_obj.submission_deadline = payload.submission_deadline
    if payload.rubric_overrides is not None:
        hack_obj.rubric_overrides = payload.rubric_overrides

    await db.commit()
    await db.refresh(hack_obj)
    return hack_obj


@router.post("/{hackathon_id}/publish-results")
async def publish_results(
    hackathon_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("organizer")),
    scope: uuid.UUID = Depends(require_hackathon_scope())
):
    """Publish hackathon results."""
    hack = await db.execute(select(Hackathon).where(Hackathon.id == hackathon_id))
    hack_obj = hack.scalar_one_or_none()
    if not hack_obj:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    if hack_obj.status != HackathonStatus.JUDGING:
        raise HTTPException(status_code=400, detail="Can only publish results when in judging phase")

    hack_obj.status = HackathonStatus.RESULTS_PUBLISHED
    hack_obj.results_published_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    # TODO: Trigger notify_results_task in celery here
    return {"message": "Results published successfully", "status": "results_published"}
