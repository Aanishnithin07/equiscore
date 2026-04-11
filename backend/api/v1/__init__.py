"""EquiScore API v1 — versioned route aggregation."""

from fastapi import APIRouter

from api.v1.routes import (
    evaluation, leaderboard, behavior, reports, 
    auth, hackathons, invites, websocket, plagiarism
)

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
v1_router.include_router(
    behavior.router,
    tags=["Behavior"],
)
v1_router.include_router(
    reports.router,
    tags=["Reports"],
)
v1_router.include_router(
    auth.router,
    tags=["Auth"],
)
v1_router.include_router(
    hackathons.router,
    tags=["Hackathons"],
)
v1_router.include_router(
    invites.router,
    tags=["Invites"],
)
v1_router.include_router(
    websocket.router,
    tags=["WebSockets"],
)
v1_router.include_router(
    plagiarism.router,
    tags=["Plagiarism"],
)
