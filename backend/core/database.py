"""
EquiScore Database Engine & Session Factory
=============================================
Configures the async SQLAlchemy 2.0 engine with asyncpg driver and a session
factory. The connection pool is sized for production workloads:
  - pool_size=5: minimum persistent connections
  - max_overflow=15: burst capacity up to 20 total connections
  - pool_recycle=3600: recycle connections every hour to avoid stale handles
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from core.config import settings

# ── Async Engine ──────────────────────────────────────────────────────────
# Uses asyncpg driver under the hood. echo=False in production to avoid
# spamming logs with SQL statements.
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=15,
    pool_recycle=3600,
    pool_pre_ping=True,  # Verify connections are alive before checkout
)

# ── Session Factory ───────────────────────────────────────────────────────
# expire_on_commit=False prevents lazy-load issues after commit in async ctx
async_session_factory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Declarative Base ──────────────────────────────────────────────────────
# All ORM models inherit from this Base to participate in metadata & migrations
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models in EquiScore."""

    pass


async def init_db() -> None:
    """
    Initialize the database by creating all tables defined in the ORM models.

    This is intended for development bootstrapping. In production, use Alembic
    migrations instead of create_all().
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def dispose_engine() -> None:
    """
    Gracefully close all database connections during application shutdown.

    Must be called during the FastAPI lifespan shutdown phase to prevent
    connection leaks.
    """
    await async_engine.dispose()
