"""bias_audits

Revision ID: 006_bias
Revises: 005_plagiarism
Create Date: 2026-04-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '006_bias'
down_revision: str | None = '005_plagiarism'

def upgrade() -> None:
    op.create_table('bias_audit_runs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('hackathon_id', sa.UUID(), nullable=False),
        sa.Column('run_by', sa.UUID(), nullable=True),
        sa.Column('total_submissions', sa.Integer(), nullable=False),
        sa.Column('overall_risk_level', sa.String(), nullable=False),
        sa.Column('full_report_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['hackathon_id'], ['hackathons.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['run_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bias_audit_runs_hackathon_id'), 'bias_audit_runs', ['hackathon_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_bias_audit_runs_hackathon_id'), table_name='bias_audit_runs')
    op.drop_table('bias_audit_runs')
