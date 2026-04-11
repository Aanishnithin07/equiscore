"""
EquiScore Alembic Migration 004 — Auth & Tenancy
==================================================
Introduces multi-tenancy auth models: Users, Hackathons, Memberships, Invites
and adds hackathon_id mapping to teams.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

# Revision identifiers
revision = "004_auth_schema"
down_revision = "003_report_jobs"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # ── Users table ───────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("global_role", sa.String(), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # ── Hackathons table ───────────────────────────────────────────────
    op.create_table(
        "hackathons",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False, unique=True, index=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("owner_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("submission_deadline", sa.DateTime(timezone=True), nullable=False),
        sa.Column("results_published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rubric_overrides", JSONB, nullable=True),
        sa.Column("max_team_size", sa.Integer(), nullable=False, server_default="4"),
        sa.Column("tracks_enabled", JSONB, nullable=False, server_default='["healthcare", "ai_ml", "open_innovation"]'),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # ── HackathonMemberships table ───────────────────────────────────────────────
    op.create_table(
        "hackathon_memberships",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hackathon_id", UUID(as_uuid=True), sa.ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("team_name", sa.String(100), nullable=True),
        sa.Column("joined_at", sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.UniqueConstraint("user_id", "hackathon_id", name="uq_user_hackathon_membership")
    )

    # ── InviteTokens table ───────────────────────────────────────────────
    op.create_table(
        "invite_tokens",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("token", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("hackathon_id", UUID(as_uuid=True), sa.ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("intended_role", sa.String(), nullable=False),
        sa.Column("intended_team_name", sa.String(100), nullable=True),
        sa.Column("created_by", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("redeemed_by", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_single_use", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("redeemed_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Modify teams to add hackathon_id
    op.add_column("teams", sa.Column("hackathon_id", UUID(as_uuid=True), nullable=True))
    op.create_foreign_key("fk_team_hackathon", "teams", "hackathons", ["hackathon_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_teams_hackathon_id", "teams", ["hackathon_id"])


def downgrade() -> None:
    op.drop_index("ix_teams_hackathon_id", table_name="teams")
    op.drop_constraint("fk_team_hackathon", "teams", type_="foreignkey")
    op.drop_column("teams", "hackathon_id")
    op.drop_table("invite_tokens")
    op.drop_table("hackathon_memberships")
    op.drop_table("hackathons")
    op.drop_table("users")
