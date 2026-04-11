"""
EquiScore Hackathon Schemas
===========================
Pydantic schemas for hackathon payload validations.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from models.user import HackathonStatus


class HackathonCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str | None = None
    submission_deadline: datetime
    tracks_enabled: list[str] = Field(default=["healthcare", "ai_ml", "open_innovation"])
    max_team_size: int = Field(default=4, ge=1, le=10)


class HackathonUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    description: str | None = None
    submission_deadline: datetime | None = None
    status: HackathonStatus | None = None
    rubric_overrides: dict | None = None


class HackathonResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: str | None
    owner_id: UUID
    status: HackathonStatus
    submission_deadline: datetime
    results_published_at: datetime | None
    rubric_overrides: dict | None
    max_team_size: int
    tracks_enabled: list[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
