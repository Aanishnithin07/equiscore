"""
EquiScore — FastAPI Application Factory
==========================================
Entry point for the EquiScore backend. Configures:
  - CORS middleware (localhost:5173 for dev, production domain configurable)
  - Request ID injection middleware (unique ID per request for tracing)
  - Structured JSON logging via structlog
  - Lifespan events for database initialization and cleanup
  - API router registration under /api/v1
"""

from __future__ import annotations

import uuid
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from typing import Any

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from api.v1.routes.auth import limiter

from api.v1 import v1_router
from core.config import settings
from core.database import dispose_engine, init_db


# ══════════════════════════════════════════════════════════════════════════
# Structured Logging Configuration
# ══════════════════════════════════════════════════════════════════════════

def configure_logging() -> None:
    """
    Configure structlog for JSON-formatted structured logging.

    All log entries include:
      - timestamp (ISO 8601)
      - log level
      - logger name
      - request_id (when available via context)

    JSON output ensures logs are machine-parsable for log aggregation
    services (ELK, Datadog, CloudWatch).
    """
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            structlog.get_level_from_name(settings.LOG_LEVEL)
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


# ══════════════════════════════════════════════════════════════════════════
# Request ID Middleware
# ══════════════════════════════════════════════════════════════════════════

class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Injects a unique request_id into every HTTP request.

    The request_id is:
      - Generated as a UUID4 for each incoming request
      - Bound to structlog's context vars for automatic inclusion in all logs
      - Added to the response headers (X-Request-ID) for client-side tracing
      - Useful for correlating logs across the request lifecycle
    """

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        """Process request with unique tracing ID."""
        request_id = str(uuid.uuid4())

        # Bind request_id to structlog context — all logs in this request
        # will automatically include it
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        logger = structlog.get_logger()
        logger.info(
            "request_started",
            method=request.method,
            path=str(request.url.path),
        )

        response = await call_next(request)

        # Add request_id to response headers for client-side correlation
        response.headers["X-Request-ID"] = request_id

        logger.info(
            "request_completed",
            method=request.method,
            path=str(request.url.path),
            status_code=response.status_code,
        )

        return response


# ══════════════════════════════════════════════════════════════════════════
# Application Lifespan
# ══════════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Manage application startup and shutdown events.

    Startup:
      - Initialize database tables (development mode — use Alembic in prod)
      - Log application boot confirmation

    Shutdown:
      - Gracefully close all database connections
      - Log shutdown completion
    """
    logger = structlog.get_logger()

    # ── Startup ───────────────────────────────────────────────────────
    logger.info(
        "application_starting",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
    )
    await init_db()
    logger.info("database_initialized")

    yield

    # ── Shutdown ──────────────────────────────────────────────────────
    await dispose_engine()
    logger.info("application_shutdown_complete")


# ══════════════════════════════════════════════════════════════════════════
# App Factory
# ══════════════════════════════════════════════════════════════════════════

def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application instance.

    Returns:
        Fully configured FastAPI app with middleware, routes, and lifespan.
    """
    # ── Configure logging first ───────────────────────────────────────
    configure_logging()

    # ── Create FastAPI instance ────────────────────────────────────────
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "EquiScore — Auditable AI platform that eliminates bias and opacity "
            "in hackathon judging. Submit pitch decks for AI-powered evaluation "
            "against track-specific rubrics with full explainability."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS Middleware ───────────────────────────────────────────────
    # Allows the React frontend (dev: localhost:5173) to access the API
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # ── Request ID Middleware ─────────────────────────────────────────
    # Must be added after CORS so it runs inside the CORS wrapper
    app.add_middleware(RequestIDMiddleware)

    # ── Register API Routes ───────────────────────────────────────────
    app.include_router(v1_router)

    # ── Health Check ──────────────────────────────────────────────────
    @app.get(
        "/health",
        tags=["System"],
        summary="Health check endpoint",
    )
    async def health_check() -> dict[str, str]:
        """Return application health status and version."""
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
        }

    return app


# ── Application Instance ─────────────────────────────────────────────────
# Used by uvicorn: `uvicorn main:app --reload`
app = create_app()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
