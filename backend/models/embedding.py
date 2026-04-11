import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from core.database import Base

class SubmissionEmbedding(Base):
    __tablename__ = "submission_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id"), unique=True, nullable=False)
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    
    # 1536 is standard text-embedding-3-small dimension layout
    embedding_vector = Column(Vector(1536), nullable=False)
    text_hash = Column(String(64), nullable=False)  # SHA-256
    
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_sub_embed_hackathon_text", "hackathon_id", "text_hash"),
    )
