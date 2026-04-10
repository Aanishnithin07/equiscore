"""
EquiScore Evaluation Task — Celery Worker
===========================================
Defines the main evaluate_pitch_task that processes pitch deck submissions
asynchronously. This task:

  1. Decodes the uploaded file from base64
  2. Extracts text content via PitchDeckExtractor
  3. Sends extracted content to the LLM for evaluation via LLMEvaluator
  4. Stores results (scores, justifications, rubric breakdowns) in PostgreSQL
  5. Handles failures with exponential backoff retry (max 3 retries)

This task runs in a Celery worker process, NOT in the FastAPI async event loop.
Therefore it uses synchronous SQLAlchemy sessions and synchronous wrappers
around the async LLM calls.
"""

from __future__ import annotations

import asyncio
import base64
import time
import uuid

import structlog
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from core.config import settings
from models.evaluation import Evaluation, EvaluationStatus, RubricScore
from schemas.evaluation import TrackEnum
from services.file_extractor import ExtractionError, PitchDeckExtractor
from services.llm_evaluator import LLMEvaluator, LLMOutputValidationError
from tasks.celery_app import celery_app

logger = structlog.get_logger(__name__)

# ── Synchronous DB engine for Celery workers ──────────────────────────────
# Celery workers run in separate processes without an async event loop,
# so we need a synchronous SQLAlchemy engine.
# Convert async URL (postgresql+asyncpg://) to sync (postgresql://)
sync_db_url = settings.DATABASE_URL.replace(
    "postgresql+asyncpg://", "postgresql://"
)
sync_engine = create_engine(
    sync_db_url,
    pool_size=3,
    max_overflow=7,
    pool_recycle=3600,
    pool_pre_ping=True,
)
SyncSessionFactory = sessionmaker(bind=sync_engine, expire_on_commit=False)


def _run_async(coro):  # type: ignore[no-untyped-def]
    """
    Run an async coroutine from within a synchronous Celery worker.

    Creates a new event loop for each invocation to avoid conflicts
    with the Celery worker's process model.

    Args:
        coro: An awaitable coroutine to execute.

    Returns:
        The result of the coroutine.
    """
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(
    bind=True,
    name="tasks.evaluation_tasks.evaluate_pitch_task",
    max_retries=3,
    default_retry_delay=10,
    acks_late=True,
)
def evaluate_pitch_task(
    self,  # type: ignore[no-untyped-def]
    evaluation_id: str,
    file_bytes_b64: str,
    filename: str,
) -> dict[str, str]:
    """
    Celery task to evaluate a pitch deck submission.

    This is the main async processing pipeline that runs outside the
    HTTP request cycle. It handles the full evaluation lifecycle:
    extraction → LLM evaluation → database persistence.

    Args:
        self: Celery task instance (bound for retry access).
        evaluation_id: UUID string of the Evaluation record to process.
        file_bytes_b64: Base64-encoded bytes of the uploaded pitch file.
        filename: Original filename for format detection.

    Returns:
        Dict with evaluation_id and final status.

    Raises:
        self.retry: On transient LLM errors (exponential backoff).
    """
    start_time = time.monotonic()
    eval_uuid = uuid.UUID(evaluation_id)

    logger.info(
        "evaluation_task_started",
        evaluation_id=evaluation_id,
        filename=filename,
        retry_count=self.request.retries,
    )

    # ── Step 1: Update status to "processing" ─────────────────────────
    with SyncSessionFactory() as session:
        _update_status(session, eval_uuid, EvaluationStatus.PROCESSING)

    # ── Step 2: Decode file from base64 ───────────────────────────────
    try:
        file_bytes = base64.b64decode(file_bytes_b64)
    except Exception as e:
        logger.error("file_decode_error", error=str(e))
        with SyncSessionFactory() as session:
            _update_status(
                session,
                eval_uuid,
                EvaluationStatus.FAILED,
                error_message=f"Failed to decode uploaded file: {e}",
            )
        return {"evaluation_id": evaluation_id, "status": "failed"}

    # ── Step 3: Extract content from the pitch deck ───────────────────
    extractor = PitchDeckExtractor()
    try:
        extracted_content = _run_async(extractor.extract(file_bytes, filename))
    except ExtractionError as e:
        logger.warning(
            "extraction_failed",
            evaluation_id=evaluation_id,
            error=str(e),
        )
        with SyncSessionFactory() as session:
            _update_status(
                session,
                eval_uuid,
                EvaluationStatus.FAILED,
                error_message=f"Content extraction failed: {e}",
            )
        return {"evaluation_id": evaluation_id, "status": "failed"}
    except Exception as e:
        logger.error(
            "extraction_unexpected_error",
            evaluation_id=evaluation_id,
            error=str(e),
        )
        with SyncSessionFactory() as session:
            _update_status(
                session,
                eval_uuid,
                EvaluationStatus.FAILED,
                error_message=f"Unexpected extraction error: {e}",
            )
        return {"evaluation_id": evaluation_id, "status": "failed"}

    logger.info(
        "extraction_completed",
        evaluation_id=evaluation_id,
        slide_count=extracted_content.slide_count,
        word_count=extracted_content.word_count,
        warnings=extracted_content.extraction_warnings,
    )

    # ── Step 4: Evaluate via LLM ──────────────────────────────────────
    # Determine the track for this evaluation
    with SyncSessionFactory() as session:
        evaluation = session.execute(
            select(Evaluation).where(Evaluation.id == eval_uuid)
        ).scalar_one_or_none()
        if not evaluation:
            logger.error("evaluation_not_found", evaluation_id=evaluation_id)
            return {"evaluation_id": evaluation_id, "status": "failed"}
        track = TrackEnum(evaluation.team.track.value)

    evaluator = LLMEvaluator()
    try:
        llm_result = _run_async(evaluator.evaluate(extracted_content, track))
    except LLMOutputValidationError as e:
        logger.error(
            "llm_validation_error",
            evaluation_id=evaluation_id,
            error=str(e),
            raw_response_preview=e.raw_response[:300],
        )
        with SyncSessionFactory() as session:
            _update_status(
                session,
                eval_uuid,
                EvaluationStatus.FAILED,
                error_message=f"LLM output validation failed: {e}",
            )
        return {"evaluation_id": evaluation_id, "status": "failed"}
    except Exception as e:
        # ── Retry on transient errors with exponential backoff ────────
        logger.warning(
            "llm_call_failed_retrying",
            evaluation_id=evaluation_id,
            error=str(e),
            retry_count=self.request.retries,
        )
        countdown = 2 ** self.request.retries * 10  # 10s, 20s, 40s
        raise self.retry(exc=e, countdown=countdown)

    # ── Step 5: Persist results to database ───────────────────────────
    with SyncSessionFactory() as session:
        evaluation = session.execute(
            select(Evaluation).where(Evaluation.id == eval_uuid)
        ).scalar_one()

        # Update evaluation record
        evaluation.status = EvaluationStatus.COMPLETED
        evaluation.overall_score = llm_result.overall_score
        evaluation.raw_llm_output = llm_result.model_dump()

        # ── Step 6: Upsert rubric scores ──────────────────────────────
        for rubric_score_detail in llm_result.rubric_scores:
            rubric_score = RubricScore(
                evaluation_id=eval_uuid,
                category=rubric_score_detail.category,
                score=rubric_score_detail.raw_score,
                weight=rubric_score_detail.weight,
                weighted_score=rubric_score_detail.weighted_score,
                justification=rubric_score_detail.one_line_justification,
                is_strength=rubric_score_detail.raw_score >= 7,
            )
            session.add(rubric_score)

        session.commit()

    elapsed = time.monotonic() - start_time
    logger.info(
        "evaluation_task_completed",
        evaluation_id=evaluation_id,
        overall_score=llm_result.overall_score,
        elapsed_seconds=round(elapsed, 2),
    )

    return {"evaluation_id": evaluation_id, "status": "completed"}


def _update_status(
    session: Session,
    evaluation_id: uuid.UUID,
    status: EvaluationStatus,
    error_message: str | None = None,
) -> None:
    """
    Update the status of an evaluation record in the database.

    Args:
        session: SQLAlchemy sync session.
        evaluation_id: UUID of the evaluation to update.
        status: New status to set.
        error_message: Optional error details (for FAILED status).
    """
    evaluation = session.execute(
        select(Evaluation).where(Evaluation.id == evaluation_id)
    ).scalar_one_or_none()

    if evaluation:
        evaluation.status = status
        if error_message:
            evaluation.error_message = error_message
        session.commit()
    else:
        logger.error(
            "evaluation_not_found_for_status_update",
            evaluation_id=str(evaluation_id),
            target_status=status.value,
        )
