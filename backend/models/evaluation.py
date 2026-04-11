"""
EquiScore ORM Models — Evaluation Domain
==========================================
Defines the core data model for the evaluation pipeline:

  Team → Evaluation → RubricScore

All models use UUID primary keys (generated server-side via gen_random_uuid)
and timezone-aware timestamps. The Evaluation model stores the full LLM
response in a JSONB column for complete auditability.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    LargeBinary,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


# ── Enums ─────────────────────────────────────────────────────────────────
class TrackType(str, enum.Enum):
    """Hackathon tracks supported by the evaluation system."""

    HEALTHCARE = "healthcare"
    AI_ML = "ai_ml"
    OPEN_INNOVATION = "open_innovation"


class EvaluationStatus(str, enum.Enum):
    """Lifecycle stages of an evaluation job."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ── Team Model ────────────────────────────────────────────────────────────
class Team(Base):
    """
    Represents a hackathon team that has submitted a pitch deck.

    A team has a unique name and is associated with one track. Multiple
    evaluations may be linked to a single team (e.g., re-submissions).
    """

    __tablename__ = "teams"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Unique team identifier",
    )
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        comment="Team name — must be unique across all tracks",
    )
    track: Mapped[TrackType] = mapped_column(
        Enum(TrackType, name="track_type", create_constraint=True),
        nullable=False,
        comment="Hackathon track the team is competing in",
    )
    hackathon_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hackathons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    submission_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Timestamp of the team's first submission",
    )

    # ── Relationships ─────────────────────────────────────────────────
    evaluations: Mapped[list["Evaluation"]] = relationship(
        "Evaluation",
        back_populates="team",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Team(name='{self.name}', track='{self.track.value}')>"


# ── Evaluation Model ─────────────────────────────────────────────────────
class Evaluation(Base):
    """
    Represents a single evaluation job for a team's pitch deck.

    The job_id is the externally-visible identifier returned to clients.
    The raw_llm_output column stores the complete LLM response as JSONB
    for full auditability — no information is discarded.
    """

    __tablename__ = "evaluations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Internal evaluation identifier",
    )
    team_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("teams.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="FK to the team that owns this evaluation",
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        nullable=False,
        default=uuid.uuid4,
        index=True,
        comment="Public-facing job ID returned to clients for polling",
    )
    status: Mapped[EvaluationStatus] = mapped_column(
        Enum(EvaluationStatus, name="evaluation_status", create_constraint=True),
        nullable=False,
        default=EvaluationStatus.PENDING,
        comment="Current lifecycle status of the evaluation job",
    )
    overall_score: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Final weighted score (0–100), populated on completion",
    )
    raw_llm_output: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
        comment="Complete LLM response stored for auditability",
    )
    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Error details if evaluation failed",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Timestamp when the evaluation was created",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        comment="Timestamp of the last status update",
    )

    # ── Relationships ─────────────────────────────────────────────────
    team: Mapped["Team"] = relationship(
        "Team",
        back_populates="evaluations",
    )
    rubric_scores: Mapped[list["RubricScore"]] = relationship(
        "RubricScore",
        back_populates="evaluation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    behavior_jobs: Mapped[list["BehaviorJob"]] = relationship(
        "BehaviorJob",
        back_populates="evaluation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    report_jobs: Mapped[list["ReportJob"]] = relationship(
        "ReportJob",
        back_populates="evaluation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Evaluation(job_id='{self.job_id}', status='{self.status.value}')>"


# ── BehaviorJob Model ────────────────────────────────────────────────────
class BehaviorJob(Base):
    """
    Tracks the asynchronous processing of audio/video behavioral analysis
    Extracted metrics and LLM results are stored in the JSONB result column.
    """
    __tablename__ = "behavior_jobs"

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    evaluation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evaluations.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    status: Mapped[str] = mapped_column(String, default="pending", index=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    evaluation: Mapped["Evaluation"] = relationship("Evaluation", back_populates="behavior_jobs")


# ── ReportJob Model ──────────────────────────────────────────────────────
class ReportJob(Base):
    """
    Tracks the asynchronous generation of the Personalized Growth Report PDF.
    """
    __tablename__ = "report_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )
    evaluation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evaluations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(String, default="pending", index=True)
    pdf_bytes: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    evaluation: Mapped["Evaluation"] = relationship("Evaluation", back_populates="report_jobs")


# ── RubricScore Model ────────────────────────────────────────────────────
class RubricScore(Base):
    """
    Stores a single rubric category score for an evaluation.

    Each evaluation has multiple RubricScore rows — one per rubric category
    (e.g., "Technical Feasibility", "Innovation"). The justification field
    contains the LLM's human-readable explanation for the score.
    """

    __tablename__ = "rubric_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        comment="Unique rubric score identifier",
    )
    evaluation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evaluations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="FK to the parent evaluation",
    )
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Rubric category name (e.g., 'Clinical Feasibility')",
    )
    score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Raw score for this category (0–10 scale)",
    )
    weight: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Weight applied to this category for the given track",
    )
    weighted_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="score * weight * 10 — contribution to overall 0–100 score",
    )
    justification: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="LLM-generated explanation for the assigned score",
    )
    is_strength: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="True if this category is a notable strength (score >= 7)",
    )

    # ── Relationships ─────────────────────────────────────────────────
    evaluation: Mapped["Evaluation"] = relationship(
        "Evaluation",
        back_populates="rubric_scores",
    )

    def __repr__(self) -> str:
        return f"<RubricScore(category='{self.category}', score={self.score})>"
