"""
EquiScore API v1 — Evaluation Routes
=======================================
Handles pitch deck submission and evaluation status polling.

Endpoints:
  POST /api/v1/evaluate-pitch  — Upload pitch deck for async evaluation
  GET  /api/v1/evaluation/{job_id}  — Poll evaluation status/results

Security:
  - File MIME type validation (application/pdf or PPTX MIME)
  - Magic bytes validation (PDF: %PDF, PPTX: PK zip header)
  - File size enforcement (50MB default)
  - Text sanitization before LLM injection
"""

from __future__ import annotations

import base64
import uuid

import structlog
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.permissions import require_role, get_current_hackathon_id
from models.user import User

from core.dependencies import get_db
from models.evaluation import (
    Evaluation,
    EvaluationStatus,
    Team,
    TrackType,
)
from schemas.evaluation import (
    EvaluationStatusResponse,
    EvaluationSubmissionResponse,
    LLMEvaluationOutput,
    TrackEnum,
)
from tasks.evaluation_tasks import evaluate_pitch_task
from core.config import settings

logger = structlog.get_logger(__name__)

router = APIRouter()

# ── Allowed MIME types for pitch deck uploads ─────────────────────────────
ALLOWED_MIME_TYPES: set[str] = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}

# ── Magic bytes for file format verification ──────────────────────────────
# PDF files start with "%PDF" (hex: 25 50 44 46)
# PPTX files are ZIP archives starting with "PK" (hex: 50 4B)
PDF_MAGIC = b"%PDF"
PPTX_MAGIC = b"PK"


@router.post(
    "/evaluate-pitch",
    response_model=EvaluationSubmissionResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit a pitch deck for AI evaluation",
    description=(
        "Upload a PDF or PPTX pitch deck for evaluation against the "
        "track-specific rubric. Returns a job_id immediately — evaluation "
        "runs asynchronously via Celery workers."
    ),
    responses={
        400: {"description": "Invalid file type, corrupt file, or bad request"},
        413: {"description": "File exceeds size limit"},
    },
)
async def submit_evaluation(
    team_name: str = Form(
        ...,
        min_length=2,
        max_length=100,
        description="Team name (2–100 characters)",
    ),
    track: TrackEnum = Form(
        ...,
        description="Hackathon track to evaluate against",
    ),
    pitch_file: UploadFile = File(
        ...,
        description="Pitch deck file (.pdf or .pptx, max 50MB)",
    ),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("organizer", "team_member")),
    hackathon_id: uuid.UUID = Depends(get_current_hackathon_id),
) -> EvaluationSubmissionResponse:
    """
    Submit a pitch deck for asynchronous AI evaluation.

    Workflow:
      1. Validate file type (MIME + magic bytes)
      2. Enforce file size limit (50MB)
      3. Create/upsert Team record in database
      4. Create Evaluation record with status="pending"
      5. Dispatch Celery task with base64-encoded file bytes
      6. Return job_id immediately for polling

    Args:
        team_name: Name of the team (unique, used for upsert).
        track: Hackathon track for rubric selection.
        pitch_file: Uploaded pitch deck file.
        db: Async database session (injected).

    Returns:
        EvaluationSubmissionResponse with job_id for status polling.

    Raises:
        HTTPException 400: Invalid file type or corrupt file.
        HTTPException 413: File exceeds size limit.
    """
    # ── Step 1: Validate MIME type ────────────────────────────────────
    if pitch_file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid file type: {pitch_file.content_type}. "
                "Only PDF (.pdf) and PowerPoint (.pptx) files are accepted."
            ),
        )

    # ── Step 2: Read file bytes and enforce size limit ────────────────
    file_bytes = await pitch_file.read()
    max_size = settings.max_file_size_bytes

    if len(file_bytes) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File size ({len(file_bytes) / (1024 * 1024):.1f}MB) exceeds "
                f"the {settings.MAX_FILE_SIZE_MB}MB limit."
            ),
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # ── Step 3: Validate magic bytes ──────────────────────────────────
    # This prevents MIME type spoofing (e.g., renaming a JPEG to .pdf)
    _validate_magic_bytes(file_bytes, pitch_file.filename or "unknown")

    # ── Step 4: Upsert Team record ────────────────────────────────────
    # Use the ORM TrackType enum for the database model
    db_track = TrackType(track.value)
    team = await _upsert_team(db, team_name, db_track, hackathon_id)

    # ── Step 5: Create Evaluation record ──────────────────────────────
    job_id = uuid.uuid4()
    evaluation = Evaluation(
        team_id=team.id,
        job_id=job_id,
        status=EvaluationStatus.PENDING,
    )
    db.add(evaluation)
    await db.commit()
    await db.refresh(evaluation)

    logger.info(
        "evaluation_submitted",
        job_id=str(job_id),
        team_name=team_name,
        track=track.value,
        file_size_bytes=len(file_bytes),
        filename=pitch_file.filename,
    )

    # ── Step 6: Dispatch Celery task ──────────────────────────────────
    # Encode file bytes as base64 for JSON-safe serialization via Celery
    file_bytes_b64 = base64.b64encode(file_bytes).decode("utf-8")
    evaluate_pitch_task.delay(
        str(evaluation.id),
        file_bytes_b64,
        pitch_file.filename or "pitch_deck",
    )

    return EvaluationSubmissionResponse(
        job_id=job_id,
        status="pending",
        message="Evaluation queued. Poll /evaluation/{job_id} for results.",
        estimated_wait_seconds=30,
    )


@router.get(
    "/evaluation/{job_id}",
    response_model=EvaluationStatusResponse,
    summary="Get evaluation status and results",
    description=(
        "Poll the status of an evaluation by job_id. Returns full results "
        "when status is 'completed', error details when 'failed', or "
        "status-only when 'pending'/'processing'."
    ),
    responses={
        404: {"description": "Evaluation not found for the given job_id"},
    },
)
async def get_evaluation_status(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("organizer", "judge", "team_member")),
    hackathon_id: uuid.UUID = Depends(get_current_hackathon_id),
) -> EvaluationStatusResponse:
    """
    Get the current status and results of an evaluation.

    Args:
        job_id: The UUID job identifier returned by POST /evaluate-pitch.
        db: Async database session (injected).

    Returns:
        Full EvaluationStatusResponse including results when completed.

    Raises:
        HTTPException 404: If no evaluation exists with the given job_id.
    """
    # ── Query evaluation with team relationship ───────────────────────
    result = await db.execute(
        select(Evaluation)
        .join(Team, Evaluation.team_id == Team.id)
        .where(Evaluation.job_id == job_id)
        .where(Team.hackathon_id == hackathon_id)
    )
    evaluation = result.scalar_one_or_none()

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No evaluation found for job_id: {job_id}",
        )

    # ── Build response ────────────────────────────────────────────────
    # Parse raw_llm_output back into Pydantic model if evaluation completed
    llm_result = None
    if evaluation.status == EvaluationStatus.COMPLETED and evaluation.raw_llm_output:
        try:
            llm_result = LLMEvaluationOutput.model_validate(
                evaluation.raw_llm_output
            )
        except Exception as e:
            logger.error(
                "stored_llm_output_validation_error",
                job_id=str(job_id),
                error=str(e),
            )

    return EvaluationStatusResponse(
        job_id=evaluation.job_id,
        status=evaluation.status.value,
        team_name=evaluation.team.name,
        track=TrackEnum(evaluation.team.track.value),
        result=llm_result,
        error=evaluation.error_message,
        created_at=evaluation.created_at,
        completed_at=(
            evaluation.updated_at
            if evaluation.status in (EvaluationStatus.COMPLETED, EvaluationStatus.FAILED)
            else None
        ),
    )


# ══════════════════════════════════════════════════════════════════════════
# Helper Functions
# ══════════════════════════════════════════════════════════════════════════

def _validate_magic_bytes(file_bytes: bytes, filename: str) -> None:
    """
    Validate file format by checking magic bytes (file signature).

    This is a defense-in-depth measure against MIME type spoofing.
    A file renamed from .jpg to .pdf would pass MIME validation but fail
    here because its first bytes would be JPEG magic, not PDF magic.

    Args:
        file_bytes: Raw file bytes to inspect.
        filename: Original filename for error messages.

    Raises:
        HTTPException 400: If magic bytes don't match expected format.
    """
    lower_filename = filename.lower()

    if lower_filename.endswith(".pdf"):
        if not file_bytes[:4].startswith(PDF_MAGIC):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "File claims to be PDF but magic bytes don't match. "
                    "The file may be corrupt or misnamed."
                ),
            )
    elif lower_filename.endswith(".pptx"):
        if not file_bytes[:2].startswith(PPTX_MAGIC):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "File claims to be PPTX but magic bytes don't match. "
                    "The file may be corrupt or misnamed."
                ),
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file extension: {filename}. "
                "Only .pdf and .pptx files are accepted."
            ),
        )


async def _upsert_team(
    db: AsyncSession,
    team_name: str,
    track: TrackType,
    hackathon_id: uuid.UUID,
) -> Team:
    """
    Create a new team or return the existing one (upsert by name).

    If a team with the same name already exists, its track is updated
    to the latest submission's track.

    Args:
        db: Async database session.
        team_name: Team name to upsert.
        track: Hackathon track for the team.

    Returns:
        The Team ORM instance (created or existing).
    """
    # Normalize team name for consistent matching
    normalized_name = " ".join(team_name.split())

    result = await db.execute(
        select(Team)
        .where(Team.name == normalized_name)
        .where(Team.hackathon_id == hackathon_id)
    )
    team = result.scalar_one_or_none()

    if team:
        # Update track if team re-submits under a different track
        team.track = track
        await db.commit()
        await db.refresh(team)
    else:
        team = Team(name=normalized_name, track=track, hackathon_id=hackathon_id)
        db.add(team)
        await db.commit()
        await db.refresh(team)

    return team
