"""
EquiScore Pydantic v2 Schemas — Evaluation Domain
====================================================
All request/response models for the evaluation pipeline. These schemas
enforce strict validation at the API boundary and ensure type safety
throughout the application.

Key design decisions:
  - TrackEnum is a str Enum for JSON serialization compatibility
  - LLMEvaluationOutput mirrors the exact JSON structure the LLM must return
  - ConfigDict with from_attributes=True enables ORM → schema conversion
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ══════════════════════════════════════════════════════════════════════════
# Enums
# ══════════════════════════════════════════════════════════════════════════

class TrackEnum(str, enum.Enum):
    """Hackathon tracks — must match the ORM TrackType enum."""

    HEALTHCARE = "healthcare"
    AI_ML = "ai_ml"
    OPEN_INNOVATION = "open_innovation"


class EvaluationStatusEnum(str, enum.Enum):
    """Evaluation job lifecycle states."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ══════════════════════════════════════════════════════════════════════════
# Request Schemas
# ══════════════════════════════════════════════════════════════════════════

class EvaluationRequest(BaseModel):
    """
    Schema for the POST /evaluate-pitch form data.

    Note: The file upload (pitch_file) is handled separately via FastAPI's
    UploadFile parameter in the route handler, not through this model.
    This model validates the text-field portion of the multipart form.
    """

    team_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Team name — must be unique, 2–100 characters",
        examples=["NeuralMedics"],
    )
    track: TrackEnum = Field(
        ...,
        description="Hackathon track the team is competing in",
        examples=[TrackEnum.HEALTHCARE],
    )

    @field_validator("team_name")
    @classmethod
    def sanitize_team_name(cls, v: str) -> str:
        """Strip leading/trailing whitespace and collapse internal spaces."""
        return " ".join(v.split())


# ══════════════════════════════════════════════════════════════════════════
# Response Schemas — Submission
# ══════════════════════════════════════════════════════════════════════════

class EvaluationSubmissionResponse(BaseModel):
    """
    Immediate response returned when a pitch deck is submitted for evaluation.

    The client receives a job_id to poll for results. Processing happens
    asynchronously via Celery workers.
    """

    job_id: uuid.UUID = Field(
        ...,
        description="Unique job identifier — use to poll GET /evaluation/{job_id}",
    )
    status: str = Field(
        default="pending",
        description="Initial job status",
    )
    message: str = Field(
        default="Evaluation queued. Poll /evaluation/{job_id} for results.",
        description="Human-readable status message",
    )
    estimated_wait_seconds: int = Field(
        default=30,
        description="Estimated time until evaluation completes",
    )


# ══════════════════════════════════════════════════════════════════════════
# LLM Output Schemas — Structured JSON from GPT-4o
# ══════════════════════════════════════════════════════════════════════════

class RubricScoreDetail(BaseModel):
    """
    Single rubric category score as returned by the LLM.

    The LLM must produce one of these for each category in the track rubric.
    weighted_score = raw_score * weight * 10 (contributes to 0–100 overall).
    """

    category: str = Field(
        ...,
        description="Rubric category name matching the track definition",
        examples=["Clinical Feasibility"],
    )
    weight: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Weight for this category in the given track (0.0–1.0)",
    )
    raw_score: int = Field(
        ...,
        ge=0,
        le=10,
        description="Raw score on a 0–10 scale",
    )
    weighted_score: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="raw_score * weight contributing to the overall score",
    )
    one_line_justification: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="One-line explanation grounded in specific pitch content",
    )


class LLMEvaluationOutput(BaseModel):
    """
    Complete structured output that the LLM MUST return.

    This schema is used both as the prompt specification (telling the LLM
    what shape the JSON must have) and as the validator (parsing the LLM
    response and raising if it doesn't match).

    All scores, justifications, and flags are validated for range and length
    to catch malformed LLM outputs before they reach the database.
    """

    overall_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Weighted overall score across all rubric categories (0–100)",
    )
    track_alignment: str = Field(
        ...,
        min_length=20,
        max_length=1000,
        description="2–4 sentence evaluation of how well the project fits the declared track",
    )
    strengths: list[str] = Field(
        ...,
        min_length=2,
        max_length=6,
        description="2–6 specific, evidence-based strengths (each 1–3 sentences)",
    )
    weaknesses: list[str] = Field(
        ...,
        min_length=2,
        max_length=6,
        description="2–6 specific, evidence-based weaknesses (each 1–3 sentences)",
    )
    rubric_scores: list[RubricScoreDetail] = Field(
        ...,
        min_length=4,
        max_length=6,
        description="One score per rubric category for the given track",
    )
    rubric_justification: str = Field(
        ...,
        min_length=50,
        max_length=2000,
        description="3–6 sentence narrative synthesizing all scoring decisions",
    )
    suggested_judge_questions: list[str] = Field(
        ...,
        min_length=3,
        max_length=5,
        description="3–5 probing questions targeting identified weaknesses",
    )
    disqualification_flags: list[str] = Field(
        default_factory=list,
        max_length=5,
        description="Empty if none — populated if plagiarized, off-track, or unreadable",
    )

    @field_validator("strengths", "weaknesses")
    @classmethod
    def validate_item_length(cls, v: list[str]) -> list[str]:
        """Ensure each strength/weakness is substantive (at least 20 chars)."""
        for i, item in enumerate(v):
            if len(item.strip()) < 20:
                raise ValueError(
                    f"Item {i + 1} is too short ({len(item)} chars). "
                    "Each item must be at least 20 characters with specific evidence."
                )
        return v

    @field_validator("suggested_judge_questions")
    @classmethod
    def validate_questions_are_questions(cls, v: list[str]) -> list[str]:
        """Ensure each suggested question ends with a question mark."""
        for i, q in enumerate(v):
            if not q.strip().endswith("?"):
                # Auto-fix: append question mark if missing
                v[i] = q.strip() + "?"
        return v


# ══════════════════════════════════════════════════════════════════════════
# Response Schemas — Evaluation Status (Polling)
# ══════════════════════════════════════════════════════════════════════════

class EvaluationStatusResponse(BaseModel):
    """
    Full evaluation response returned when polling GET /evaluation/{job_id}.

    When status is 'completed', the result field contains the full LLM
    evaluation. When 'pending' or 'processing', result is None.
    When 'failed', the error field contains the failure reason.
    """

    model_config = ConfigDict(from_attributes=True)

    job_id: uuid.UUID = Field(
        ...,
        description="The job identifier used for polling",
    )
    status: EvaluationStatusEnum = Field(
        ...,
        description="Current evaluation lifecycle status",
    )
    team_name: str = Field(
        ...,
        description="Name of the team being evaluated",
    )
    track: TrackEnum = Field(
        ...,
        description="Hackathon track",
    )
    result: LLMEvaluationOutput | None = Field(
        default=None,
        description="Full evaluation result — populated only when status is 'completed'",
    )
    error: str | None = Field(
        default=None,
        description="Error message — populated only when status is 'failed'",
    )
    created_at: datetime = Field(
        ...,
        description="When the evaluation was submitted",
    )
    completed_at: datetime | None = Field(
        default=None,
        description="When the evaluation finished (completed or failed)",
    )


# ══════════════════════════════════════════════════════════════════════════
# Response Schemas — Leaderboard
# ══════════════════════════════════════════════════════════════════════════

class LeaderboardEntry(BaseModel):
    """Single row in the leaderboard response."""

    model_config = ConfigDict(from_attributes=True)

    rank: int = Field(
        ...,
        ge=1,
        description="Position in the leaderboard (1-indexed)",
    )
    team_name: str = Field(
        ...,
        description="Team name",
    )
    track: TrackEnum = Field(
        ...,
        description="Hackathon track",
    )
    overall_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall weighted score",
    )
    top_strength: str = Field(
        ...,
        description="First strength from the evaluation (summary preview)",
    )


class LeaderboardResponse(BaseModel):
    """Paginated leaderboard response."""

    entries: list[LeaderboardEntry] = Field(
        ...,
        description="Leaderboard entries ordered by score descending",
    )
    total_count: int = Field(
        ...,
        ge=0,
        description="Total number of completed evaluations matching the filter",
    )
    track_filter: TrackEnum | None = Field(
        default=None,
        description="Track filter applied, or None for all tracks",
    )
