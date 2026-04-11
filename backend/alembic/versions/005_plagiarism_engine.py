"""plagiarism_engine

Revision ID: 005_plagiarism
Revises: 004_auth_schema
Create Date: 2026-04-11 11:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import pgvector.sqlalchemy

# revision identifiers, used by Alembic.
revision: str = '005_plagiarism'
down_revision: Union[str, None] = '004_auth_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # --- Enable pgvector ---
    op.execute('CREATE EXTENSION IF NOT EXISTS vector;')

    # --- Create SubmissionEmbeddings ---
    op.create_table('submission_embeddings',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('evaluation_id', sa.UUID(), nullable=False),
        sa.Column('hackathon_id', sa.UUID(), nullable=False),
        sa.Column('embedding_vector', pgvector.sqlalchemy.Vector(dim=1536), nullable=False),
        sa.Column('text_hash', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['evaluation_id'], ['evaluations.id'], ),
        sa.ForeignKeyConstraint(['hackathon_id'], ['hackathons.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('evaluation_id')
    )
    op.create_index('ix_sub_embed_hackathon_text', 'submission_embeddings', ['hackathon_id', 'text_hash'], unique=False)

    # --- Create SimilarityResults ---
    op.create_table('similarity_results',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('hackathon_id', sa.UUID(), nullable=False),
        sa.Column('embedding_a_id', sa.UUID(), nullable=False),
        sa.Column('embedding_b_id', sa.UUID(), nullable=False),
        sa.Column('cosine_similarity', sa.Float(), nullable=False),
        sa.Column('is_flagged', sa.Boolean(), nullable=True),
        sa.Column('reviewed_by_organizer', sa.Boolean(), nullable=True),
        sa.Column('organizer_note', sa.String(), nullable=True),
        sa.Column('computed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['embedding_a_id'], ['submission_embeddings.id'], ),
        sa.ForeignKeyConstraint(['embedding_b_id'], ['submission_embeddings.id'], ),
        sa.ForeignKeyConstraint(['hackathon_id'], ['hackathons.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('embedding_a_id', 'embedding_b_id', name='uix_similarity_pairs')
    )
    op.create_index('ix_simresult_hackathon_flag', 'similarity_results', ['hackathon_id', 'is_flagged'], unique=False)

def downgrade() -> None:
    op.drop_index('ix_simresult_hackathon_flag', table_name='similarity_results')
    op.drop_table('similarity_results')
    op.drop_index('ix_sub_embed_hackathon_text', table_name='submission_embeddings')
    op.drop_table('submission_embeddings')
    op.execute('DROP EXTENSION IF EXISTS vector;')
