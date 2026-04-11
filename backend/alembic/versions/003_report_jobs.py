"""
EquiScore Alembic Migration 003 — Add Report Jobs
===================================================
Creates the report_jobs table to track asynchronous Personalized Growth Report PDF generation.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# Revision identifiers
revision = "003_report_jobs"
down_revision = "002_behavior_jobs"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # ── Report Jobs table ───────────────────────────────────────────────
    op.create_table(
        "report_jobs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("evaluation_id", UUID(as_uuid=True), 
                  sa.ForeignKey("evaluations.id", ondelete="CASCADE"),
                  nullable=False, index=True),
        sa.Column("status", sa.String(), nullable=False, server_default="pending", index=True),
        sa.Column("pdf_bytes", sa.LargeBinary(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=True),
    )

def downgrade() -> None:
    op.drop_table("report_jobs")
