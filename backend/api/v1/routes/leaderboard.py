"""
EquiScore API v1 — Leaderboard Routes
========================================
Provides the leaderboard endpoint showing all completed evaluations
ranked by overall_score.

Features:
  - Track-based filtering (optional)
  - Pagination (limit + offset)
  - Redis caching with 30-second TTL for high-traffic resilience
"""

from __future__ import annotations

import json

import structlog
from fastapi import APIRouter, Depends, Query
from redis.asyncio import Redis
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from core.permissions import require_role, get_current_hackathon_id
from models.user import User

from core.dependencies import get_db, get_redis
from models.evaluation import Evaluation, EvaluationStatus, Team, TrackType
from schemas.evaluation import (
    LeaderboardEntry,
    LeaderboardResponse,
    TrackEnum,
)

logger = structlog.get_logger(__name__)

router = APIRouter()


@router.get(
    "/leaderboard",
    response_model=LeaderboardResponse,
    summary="Get ranked leaderboard of evaluations",
    description=(
        "Returns all completed evaluations ranked by overall_score (descending). "
        "Supports optional track filtering and pagination. Results are cached "
        "in Redis for 30 seconds."
    ),
)
async def get_leaderboard(
    track: TrackEnum | None = Query(
        default=None,
        description="Filter by hackathon track (omit for all tracks)",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Maximum number of entries to return (1–100)",
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description="Number of entries to skip for pagination",
    ),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
    user: User = Depends(require_role("organizer", "judge")),
    hackathon_id: uuid.UUID = Depends(get_current_hackathon_id),
) -> LeaderboardResponse:
    """
    Retrieve the ranked leaderboard of completed evaluations.

    Checks Redis cache first (30s TTL). On cache miss, queries PostgreSQL,
    caches the result, and returns it.

    Args:
        track: Optional track filter.
        limit: Page size (default 20, max 100).
        offset: Pagination offset (default 0).
        db: Async database session (injected).
        redis: Async Redis client (injected).

    Returns:
        LeaderboardResponse with ranked entries, total count, and filter info.
    """
    # ── Build Redis cache key ─────────────────────────────────────────
    track_key = track.value if track else "all"
    cache_key = f"leaderboard:{hackathon_id}:{track_key}:{limit}:{offset}"

    # ── Check cache ───────────────────────────────────────────────────
    try:
        cached = await redis.get(cache_key)
        if cached:
            logger.debug("leaderboard_cache_hit", cache_key=cache_key)
            return LeaderboardResponse.model_validate_json(cached)
    except Exception as e:
        # Redis failure should not break the API — fall through to DB
        logger.warning("redis_cache_read_error", error=str(e))

    # ── Build database query ──────────────────────────────────────────
    # Base query: join Evaluation with Team, filter to completed only
    base_query = (
        select(Evaluation, Team)
        .join(Team, Evaluation.team_id == Team.id)
        .where(Team.hackathon_id == hackathon_id)
        .where(Evaluation.status == EvaluationStatus.COMPLETED)
        .where(Evaluation.overall_score.is_not(None))
    )

    # Count query (for total_count in pagination)
    count_query = (
        select(func.count())
        .select_from(Evaluation)
        .join(Team, Evaluation.team_id == Team.id)
        .where(Team.hackathon_id == hackathon_id)
        .where(Evaluation.status == EvaluationStatus.COMPLETED)
        .where(Evaluation.overall_score.is_not(None))
    )

    # ── Apply track filter ────────────────────────────────────────────
    if track:
        db_track = TrackType(track.value)
        base_query = base_query.where(Team.track == db_track)
        count_query = count_query.where(Team.track == db_track)

    # ── Get total count ───────────────────────────────────────────────
    total_result = await db.execute(count_query)
    total_count = total_result.scalar() or 0

    # ── Execute main query with ordering and pagination ───────────────
    query = (
        base_query
        .order_by(Evaluation.overall_score.desc(), Evaluation.created_at.asc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(query)
    rows = result.all()

    # ── Build leaderboard entries ─────────────────────────────────────
    entries: list[LeaderboardEntry] = []
    for rank_offset, (evaluation, team) in enumerate(rows, start=offset + 1):
        # Extract top strength from stored LLM output
        top_strength = _extract_top_strength(evaluation.raw_llm_output)

        entries.append(
            LeaderboardEntry(
                rank=rank_offset,
                team_name=team.name,
                track=TrackEnum(team.track.value),
                overall_score=evaluation.overall_score or 0,
                top_strength=top_strength,
            )
        )

    response = LeaderboardResponse(
        entries=entries,
        total_count=total_count,
        track_filter=track,
    )

    # ── Cache the response for 30 seconds ─────────────────────────────
    try:
        await redis.setex(
            cache_key,
            30,  # TTL in seconds
            response.model_dump_json(),
        )
        logger.debug("leaderboard_cached", cache_key=cache_key, ttl=30)
    except Exception as e:
        # Cache write failure is non-critical — log and continue
        logger.warning("redis_cache_write_error", error=str(e))

    return response


def _extract_top_strength(raw_llm_output: dict | None) -> str:
    """
    Extract the first strength string from the stored LLM output.

    This is used as a preview/summary in the leaderboard view.

    Args:
        raw_llm_output: The JSONB-stored LLM evaluation output.

    Returns:
        The first strength string, or a default message if unavailable.
    """
    if not raw_llm_output:
        return "Evaluation details pending"

    strengths = raw_llm_output.get("strengths", [])
    if strengths and isinstance(strengths, list) and len(strengths) > 0:
        return str(strengths[0])

    return "No strengths data available"
