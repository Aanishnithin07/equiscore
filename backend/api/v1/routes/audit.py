import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from core.database import get_db
from core.permissions import require_role
from models.hackathon import HackathonRole
from models.audit import BiasAuditRun
from services.bias_auditor import BiasAuditor

router = APIRouter()

@router.get("/{hackathon_id}/bias-report")
async def get_bias_report(
    hackathon_id: str,
    force_rerun: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    user = Depends(require_role(HackathonRole.ORGANIZER))
):
    hack_uuid = uuid.UUID(hackathon_id)
    
    if not force_rerun:
        q = await db.execute(
            select(BiasAuditRun)
            .where(BiasAuditRun.hackathon_id == hack_uuid)
            .order_by(BiasAuditRun.created_at.desc())
            .limit(1)
        )
        latest = q.scalar_one_or_none()
        if latest:
            return latest.full_report_json

    # Run audit natively integrating SciPy statistics
    report = await BiasAuditor.run_bias_audit(hack_uuid, db)
    
    audit_run = BiasAuditRun(
        hackathon_id=hack_uuid,
        run_by=user.id,
        total_submissions=report.total_submissions_analyzed,
        overall_risk_level=report.overall_bias_risk,
        full_report_json=report.model_dump()
    )
    
    db.add(audit_run)
    await db.commit()
    
    return report

@router.get("/{hackathon_id}/bias-report/history")
async def get_bias_audit_history(
    hackathon_id: str,
    db: AsyncSession = Depends(get_db),
    user = Depends(require_role(HackathonRole.ORGANIZER))
):
    hack_uuid = uuid.UUID(hackathon_id)
    q = await db.execute(
        select(BiasAuditRun)
        .where(BiasAuditRun.hackathon_id == hack_uuid)
        .order_by(BiasAuditRun.created_at.desc())
    )
    return q.scalars().all()
