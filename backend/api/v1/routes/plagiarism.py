import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import get_db
from core.permissions import require_role
from models.hackathon import HackathonRole
from models.similarity import SimilarityResult
from schemas.plagiarism import SimilarityReport, PlagiarismReviewRequest
from services.plagiarism_detector import PlagiarismDetector

router = APIRouter(prefix="/plagiarism")

@router.get("/{hackathon_id}/report", response_model=SimilarityReport)
async def get_plagiarism_report(
    hackathon_id: str,
    db: AsyncSession = Depends(get_db),
    # Require strictly Organizer to view plagiarism details
    user = Depends(require_role(HackathonRole.ORGANIZER))
):
    try:
        hack_uuid = uuid.UUID(hackathon_id)
        report = await PlagiarismDetector.get_hackathon_similarity_report(hack_uuid, db)
        return report
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

@router.patch("/similarity/{similarity_id}/review", response_model=dict)
async def review_similarity_flag(
    similarity_id: str,
    payload: PlagiarismReviewRequest,
    db: AsyncSession = Depends(get_db),
    user = Depends(require_role(HackathonRole.ORGANIZER))
):
    try:
        sim_uuid = uuid.UUID(similarity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Similarity ID")

    sim_record = await db.get(SimilarityResult, sim_uuid)
    if not sim_record:
        raise HTTPException(status_code=404, detail="Similarity result not found")

    sim_record.reviewed_by_organizer = payload.reviewed
    if payload.organizer_note is not None:
        sim_record.organizer_note = payload.organizer_note

    await db.commit()
    return {"status": "success", "reviewed": sim_record.reviewed_by_organizer}
