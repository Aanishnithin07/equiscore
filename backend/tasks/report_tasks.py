"""
EquiScore Report Task — Celery Worker
=====================================
Defines the Celery task for generating the Personalized Growth Report PDF asynchronously.
"""

from __future__ import annotations

import asyncio
import time
import uuid
from datetime import datetime, timezone

import structlog
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from core.config import settings
from models.evaluation import Evaluation, EvaluationStatus, ReportJob
from schemas.evaluation import EvaluationStatusResponse, TrackEnum
from services.report_generator import GrowthReportGenerator
from tasks.celery_app import celery_app

logger = structlog.get_logger(__name__)

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
    """Run an async coroutine from within a synchronous Celery worker."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

def _update_status(
    session: Session,
    report_job_id: uuid.UUID,
    status: str,
    error_message: str | None = None,
    pdf_bytes: bytes | None = None
) -> None:
    job = session.execute(
        select(ReportJob).where(ReportJob.id == report_job_id)
    ).scalar_one_or_none()

    if job:
        job.status = status
        if error_message:
            job.error_message = error_message
        if pdf_bytes:
            job.pdf_bytes = pdf_bytes
            job.generated_at = datetime.now(timezone.utc)
        session.commit()
    else:
        logger.error("report_job_not_found_for_status_update", report_job_id=str(report_job_id))


@celery_app.task(
    bind=True,
    name="tasks.report_tasks.generate_report_task",
    max_retries=2,
    default_retry_delay=10,
    acks_late=True,
)
def generate_report_task(
    self,  # type: ignore[no-untyped-def]
    report_job_id: str,
) -> dict[str, str]:
    """
    Celery task to generate a PDF report for a completed evaluation.
    """
    start_time = time.monotonic()
    job_uuid = uuid.UUID(report_job_id)

    logger.info("report_task_started", report_job_id=report_job_id)

    with SyncSessionFactory() as session:
        _update_status(session, job_uuid, "processing")
        
        job = session.execute(
            select(ReportJob).where(ReportJob.id == job_uuid)
        ).scalar_one_or_none()
        
        if not job:
            return {"report_job_id": report_job_id, "status": "failed"}
            
        evaluation = session.execute(
            select(Evaluation).where(Evaluation.id == job.evaluation_id)
        ).scalar_one_or_none()
        
        if not evaluation or evaluation.status != EvaluationStatus.COMPLETED or not evaluation.raw_llm_output:
            _update_status(session, job_uuid, "failed", error_message="Evaluation not completed or not found.")
            return {"report_job_id": report_job_id, "status": "failed"}

        # Construct EvaluationStatusResponse from ORM
        from schemas.evaluation import LLMEvaluationOutput
        
        eval_data = EvaluationStatusResponse(
            job_id=evaluation.job_id,
            status=evaluation.status,
            team_name=evaluation.team.name,
            track=TrackEnum(evaluation.team.track.value),
            result=LLMEvaluationOutput.model_validate(evaluation.raw_llm_output),
            created_at=evaluation.created_at,
            completed_at=evaluation.updated_at
        )

        behavior_data = None
        # If behavior_jobs exist and completed, extract
        if evaluation.behavior_jobs:
            completed_behavior = [b for b in evaluation.behavior_jobs if b.status == "completed" and b.result]
            if completed_behavior:
                behavior_data = completed_behavior[0].result

    generator = GrowthReportGenerator()
    try:
        pdf_bytes = _run_async(generator.generate(eval_data, behavior_data))
    except Exception as e:
        logger.error(
            "report_generation_task_failed",
            report_job_id=report_job_id,
            error=str(e),
        )
        with SyncSessionFactory() as session:
            _update_status(session, job_uuid, "failed", error_message=f"Generation failed: {e}")
        return {"report_job_id": report_job_id, "status": "failed"}

    # Success, save PDF to DB
    with SyncSessionFactory() as session:
        _update_status(session, job_uuid, "completed", pdf_bytes=pdf_bytes)

    elapsed = time.monotonic() - start_time
    logger.info(
        "report_task_completed",
        report_job_id=report_job_id,
        elapsed_seconds=round(elapsed, 2),
    )

    return {"report_job_id": report_job_id, "status": "completed"}
