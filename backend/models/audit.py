import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from core.database import Base

class BiasAuditRun(Base):
    __tablename__ = "bias_audit_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True)
    run_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    total_submissions = Column(Integer, nullable=False, default=0)
    overall_risk_level = Column(String, nullable=False)
    
    # Stores the complex BiasAuditReport directly without flattening tables linearly
    full_report_json = Column(JSONB, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
