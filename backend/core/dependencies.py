"""
EquiScore Shared Dependencies (FastAPI Depends)
=================================================
Provides injectable dependencies for route handlers:
  - get_db: async database session with automatic cleanup
  - get_redis: async Redis client
  - get_current_user: placeholder for future JWT/OAuth authentication
"""

from collections.abc import AsyncGenerator
from typing import Any

import redis.asyncio as aioredis
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import async_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an async SQLAlchemy session, ensuring cleanup on exit.

    Usage in route handlers:
        async def my_route(db: AsyncSession = Depends(get_db)):
            ...

    The session is automatically closed after the request completes,
    whether it succeeds or raises an exception.
    """
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_redis() -> AsyncGenerator[aioredis.Redis, None]:
    """
    Yield an async Redis client for caching operations.

    Used by leaderboard routes for short-TTL caching (30 seconds)
    and potentially for rate limiting in future phases.

    Yields:
        An aioredis.Redis client connected to the configured REDIS_URL.
    """
    client = aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )
    try:
        yield client
    finally:
        await client.aclose()


async def get_current_user() -> dict[str, Any]:
    """
    Placeholder dependency for future authentication.

    Will be replaced with JWT token validation or OAuth2 flow in Phase 2.
    Currently returns a mock admin user to unblock development.

    Returns:
        A dict representing the authenticated user.

    Raises:
        HTTPException: When authentication is enforced and credentials are invalid.
    """
    # TODO: Replace with real auth in Phase 2 (JWT/OAuth2)
    return {
        "user_id": "system",
        "role": "admin",
        "email": "admin@equiscore.ai",
    }
