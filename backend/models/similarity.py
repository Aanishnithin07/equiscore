import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Boolean, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base

class SimilarityResult(Base):
    __tablename__ = "similarity_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    
    embedding_a_id = Column(UUID(as_uuid=True), ForeignKey("submission_embeddings.id"), nullable=False)
    embedding_b_id = Column(UUID(as_uuid=True), ForeignKey("submission_embeddings.id"), nullable=False)
    
    cosine_similarity = Column(Float, nullable=False)
    is_flagged = Column(Boolean, default=False)
    
    reviewed_by_organizer = Column(Boolean, default=False)
    organizer_note = Column(String, nullable=True)
    
    computed_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        # Ensure symmetric idempotency manually ordered Min/Max
        UniqueConstraint('embedding_a_id', 'embedding_b_id', name='uix_similarity_pairs'),
        Index("ix_simresult_hackathon_flag", "hackathon_id", "is_flagged")
    )
