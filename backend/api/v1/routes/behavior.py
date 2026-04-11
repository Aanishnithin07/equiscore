import base64
from fastapi import APIRouter, File, UploadFile, Form, Depends, HTTPException, status
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.evaluation import BehaviorJob, Evaluation, Team
from core.dependencies import get_db
from schemas.common import JobStatusResponse
from tasks.behavior_tasks import evaluate_behavior_task
from core.permissions import require_role, get_current_hackathon_id
from models.user import User

router = APIRouter(prefix="/behavior", tags=["Behavioral Analysis"])

ALLOWED_AUDIO_VIDEO_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/mp4", "video/mp4",
    "audio/wav", "audio/x-wav", "audio/m4a", "audio/x-m4a",
    "video/webm", "audio/ogg", "audio/aac"
}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

@router.post("/analyze-behavior", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def analyze_behavior(
    file: UploadFile = File(...),
    evaluation_id: Optional[uuid.UUID] = Form(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("organizer", "team_member")),
    hackathon_id: uuid.UUID = Depends(get_current_hackathon_id),
):
    """
    Upload a pitch audio or video recording for behavioral transcription and psychological analysis.
    """
    if file.content_type not in ALLOWED_AUDIO_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Must be one of: mp3, mp4, wav, m4a, webm, ogg."
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 25MB limit."
        )

    if evaluation_id:
        eval_check = await db.execute(
            select(Evaluation)
            .join(Team, Evaluation.team_id == Team.id)
            .where(Evaluation.id == evaluation_id)
            .where(Team.hackathon_id == hackathon_id)
        )
        if not eval_check.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Invalid evaluation ID or missing permissions for this hackathon.")

    # Convert to base64 immediately for celery serialization safety
    file_b64 = base64.b64encode(file_bytes).decode('utf-8')

    # Create Database Job
    new_job = BehaviorJob(
        evaluation_id=evaluation_id,
        status="pending"
    )
    db.add(new_job)
    await db.commit()
    await db.refresh(new_job)

    # Dispatch Celery Task
    eval_id_str = str(evaluation_id) if evaluation_id else None
    evaluate_behavior_task.delay(str(new_job.job_id), file_b64, file.filename, eval_id_str)

    return JobStatusResponse(
        job_id=new_job.job_id,
        status="pending",
        message="Behavioral analysis queued"
    )

@router.get("/{job_id}")
async def get_behavior_result(
    job_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("organizer", "team_member", "judge")),
    hackathon_id: uuid.UUID = Depends(get_current_hackathon_id),
):
    """
    Polls the exact status or returns the behavioral analysis result when complete.
    """
    job = await db.get(BehaviorJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Behavior job not found")

    if job.status in ("pending", "processing"):
        return {"job_id": job.job_id, "status": job.status, "message": "Job is still processing"}

    if job.status == "failed":
        return {"job_id": job.job_id, "status": "failed", "error": job.error}

    return {
        "job_id": job.job_id,
        "status": "completed",
        "result": job.result
    }
