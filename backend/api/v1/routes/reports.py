"""
EquiScore Report Routes
=======================
Endpoints for triggering and downloading Automated Personalized Growth Report PDFs.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from core.database import get_db
from models.evaluation import Evaluation, EvaluationStatus, ReportJob, Team
from tasks.report_tasks import generate_report_task
from core.permissions import require_role, get_current_hackathon_id
from models.user import User

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post(
    "/generate/{job_id}",
    summary="Trigger async PDF generation",
    responses={
        202: {"description": "PDF generation queued"},
        400: {"description": "Invalid state or evaluation score too high"},
        404: {"description": "Evaluation not found"},
    },
)
def generate_report(
    job_id: uuid.UUID,
    generate_for_all: bool = Query(False, description="Override score threshold to generate report for any team."),
    db: Session = Depends(get_db),
    user: User = Depends(require_role("organizer")),
    hackathon_id: uuid.UUID = Depends(get_current_hackathon_id),
) -> dict[str, str]:
    """
    Queue a background celery task to generate the personalized growth report PDF.
    Only allows generation for teams that did not advance (overall score < 75), unless bypassed.
    """
    evaluation = db.execute(
        select(Evaluation)
        .join(Team, Evaluation.team_id == Team.id)
        .where(Evaluation.job_id == job_id)
        .where(Team.hackathon_id == hackathon_id)
    ).scalar_one_or_none()

    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found",
        )

    if evaluation.status != EvaluationStatus.COMPLETED or evaluation.overall_score is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report can only be generated for completed evaluations",
        )

    if not generate_for_all and evaluation.overall_score >= 75:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team scored 75 or higher and likely advanced. Set generate_for_all=true to bypass.",
        )

    # Check if a report is already generating/completed to avoid duplicate work
    existing_job = db.execute(
        select(ReportJob)
        .where(ReportJob.evaluation_id == evaluation.id)
        .order_by(ReportJob.created_at.desc())
    ).scalar_one_or_none()

    if existing_job and existing_job.status in ("pending", "processing", "completed"):
        if existing_job.status == "completed":
            return {"report_job_id": str(existing_job.id), "status": "completed"}
        return {"report_job_id": str(existing_job.id), "status": "generating"}

    # Create new ReportJob tracking entry
    report_job = ReportJob(evaluation_id=evaluation.id, status="pending")
    db.add(report_job)
    db.commit()
    db.refresh(report_job)

    # Enqueue celery task
    generate_report_task.delay(str(report_job.id))

    return {
        "report_job_id": str(report_job.id),
        "status": "generating"
    }


@router.get(
    "/{report_job_id}/download",
    summary="Poll status or download complete PDF",
    responses={
        200: {"description": "Returns the PDF file bytes"},
        202: {"description": "Still generating PDF"},
        404: {"description": "Report job not found"},
        500: {"description": "Report generation failed"},
    },
)
def download_report(
    report_job_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("organizer", "team_member")),
    hackathon_id: uuid.UUID = Depends(get_current_hackathon_id),
):
    """
    Polls the report job status. 
    If completed, returns the raw PDF bytes with appropriate Content-Disposition headers.
    If pending, returns a 202 Accepted status.
    """
    report_job = db.execute(
        select(ReportJob)
        .join(Evaluation, ReportJob.evaluation_id == Evaluation.id)
        .join(Team, Evaluation.team_id == Team.id)
        .where(ReportJob.id == report_job_id)
        .where(Team.hackathon_id == hackathon_id)
    ).scalar_one_or_none()

    if not report_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report job not found",
        )

    if report_job.status in ("pending", "processing"):
        return Response(
            content=f'{{"status": "generating", "estimated_seconds": 10}}',
            media_type="application/json",
            status_code=status.HTTP_202_ACCEPTED
        )

    if report_job.status == "failed":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {report_job.error_message}",
        )

    if not report_job.pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Report marked as completed but PDF data is missing.",
        )

    team_name = report_job.evaluation.team.name
    filename = f"{team_name}_EquiScore_GrowthReport.pdf"

    return Response(
        content=report_job.pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
