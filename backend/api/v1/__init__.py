"""EquiScore API v1 — versioned route aggregation."""

from fastapi import APIRouter

from api.v1.routes import evaluation, leaderboard

# ── V1 Router ─────────────────────────────────────────────────────────────
# Aggregates all v1 route modules under the /api/v1 prefix.
# Each sub-router is tagged for OpenAPI documentation grouping.
v1_router = APIRouter(prefix="/api/v1")

v1_router.include_router(
    evaluation.router,
    tags=["Evaluations"],
)
v1_router.include_router(
    leaderboard.router,
    tags=["Leaderboard"],
)
