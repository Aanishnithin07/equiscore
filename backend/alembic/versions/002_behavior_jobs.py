"""
EquiScore Alembic Migration 002 — Add Behavior Jobs
===================================================
Creates the behavior_jobs table to track video/audio analysis 
evaluations using Whisper and GPT-4o for pitch psychology scoring.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

# Revision identifiers
revision = "002_behavior_jobs"
down_revision = "001_initial_schema"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # ── Behavior Jobs table ─────────────────────────────────────────────
    op.create_table(
        "behavior_jobs",
        sa.Column("job_id", UUID(as_uuid=True), primary_key=True),
        sa.Column("evaluation_id", UUID(as_uuid=True), 
                  sa.ForeignKey("evaluations.id", ondelete="CASCADE"),
                  nullable=True, index=True),
        sa.Column("status", sa.String(), nullable=False, server_default="pending", index=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("result", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

def downgrade() -> None:
    op.drop_table("behavior_jobs")
