"""
EquiScore Alembic Migration 001 — Initial Schema
===================================================
Creates the foundational tables for the evaluation system:
  - teams: hackathon team records
  - evaluations: evaluation job tracking with JSONB audit column
  - rubric_scores: per-category score breakdown
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


# Revision identifiers
revision = "001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial schema: teams, evaluations, rubric_scores."""

    # ── Enum types ────────────────────────────────────────────────────
    track_type = sa.Enum(
        "healthcare", "ai_ml", "open_innovation",
        name="track_type",
    )
    evaluation_status = sa.Enum(
        "pending", "processing", "completed", "failed",
        name="evaluation_status",
    )

    # ── Teams table ───────────────────────────────────────────────────
    op.create_table(
        "teams",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(100), unique=True, nullable=False,
                  index=True),
        sa.Column("track", track_type, nullable=False),
        sa.Column("submission_time", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )

    # ── Evaluations table ─────────────────────────────────────────────
    op.create_table(
        "evaluations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("team_id", UUID(as_uuid=True),
                  sa.ForeignKey("teams.id", ondelete="CASCADE"),
                  nullable=False, index=True),
        sa.Column("job_id", UUID(as_uuid=True), unique=True,
                  nullable=False, index=True),
        sa.Column("status", evaluation_status, nullable=False,
                  server_default="pending"),
        sa.Column("overall_score", sa.Integer, nullable=True),
        sa.Column("raw_llm_output", JSONB, nullable=True),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )

    # ── Rubric Scores table ───────────────────────────────────────────
    op.create_table(
        "rubric_scores",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("evaluation_id", UUID(as_uuid=True),
                  sa.ForeignKey("evaluations.id", ondelete="CASCADE"),
                  nullable=False, index=True),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("score", sa.Integer, nullable=False),
        sa.Column("weight", sa.Float, nullable=False),
        sa.Column("weighted_score", sa.Float, nullable=False),
        sa.Column("justification", sa.Text, nullable=False),
        sa.Column("is_strength", sa.Boolean, nullable=False,
                  server_default=sa.text("false")),
    )


def downgrade() -> None:
    """Drop all tables and custom enum types."""
    op.drop_table("rubric_scores")
    op.drop_table("evaluations")
    op.drop_table("teams")

    # Drop custom enum types
    sa.Enum(name="evaluation_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="track_type").drop(op.get_bind(), checkfirst=True)
