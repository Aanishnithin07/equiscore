"""
EquiScore ORM Models — User & Tenancy Domain
============================================
Defines the core users, hackathons, and membership mappings.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class GlobalRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    USER = "user"


class HackathonStatus(str, enum.Enum):
    DRAFT = "draft"
    REGISTRATION_OPEN = "registration_open"
    SUBMISSION_CLOSED = "submission_closed"
    JUDGING = "judging"
    RESULTS_PUBLISHED = "results_published"


class HackathonRole(str, enum.Enum):
    ORGANIZER = "organizer"
    JUDGE = "judge"
    TEAM_MEMBER = "team_member"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    global_role: Mapped[GlobalRole] = mapped_column(Enum(GlobalRole, name="global_role", create_constraint=True), default=GlobalRole.USER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    memberships: Mapped[list["HackathonMembership"]] = relationship("HackathonMembership", back_populates="user", cascade="all, delete-orphan")


class Hackathon(Base):
    __tablename__ = "hackathons"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    status: Mapped[HackathonStatus] = mapped_column(Enum(HackathonStatus, name="hackathon_status", create_constraint=True), default=HackathonStatus.DRAFT, nullable=False)
    submission_deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    results_published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    rubric_overrides: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    max_team_size: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    tracks_enabled: Mapped[list[str]] = mapped_column(JSONB, default=["healthcare", "ai_ml", "open_innovation"], nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    memberships: Mapped[list["HackathonMembership"]] = relationship("HackathonMembership", back_populates="hackathon", cascade="all, delete-orphan")
    invites: Mapped[list["InviteToken"]] = relationship("InviteToken", back_populates="hackathon", cascade="all, delete-orphan")


class HackathonMembership(Base):
    __tablename__ = "hackathon_memberships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    hackathon_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True)
    
    role: Mapped[HackathonRole] = mapped_column(Enum(HackathonRole, name="hackathon_role", create_constraint=True), nullable=False)
    team_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="memberships")
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="memberships")

    __table_args__ = (
        UniqueConstraint("user_id", "hackathon_id", name="uq_user_hackathon_membership"),
    )
