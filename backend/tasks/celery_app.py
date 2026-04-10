"""
EquiScore Celery Application
==============================
Configures the Celery distributed task queue with Redis as both broker
and result backend.

Key configuration:
  - JSON serialization for all messages (safe, debuggable)
  - UTC timezone for consistent scheduling
  - Task acknowledgment after completion (acks_late) for reliability
  - Worker prefetch of 1 task at a time (fair distribution for LLM tasks)
"""

from celery import Celery

from core.config import settings

# ── Celery App Instance ───────────────────────────────────────────────────
# The app is named "equiscore" — this appears in worker logs and Flower
celery_app = Celery(
    "equiscore",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

# ── Celery Configuration ─────────────────────────────────────────────────
celery_app.conf.update(
    # ── Serialization ─────────────────────────────────────────────────
    # JSON is preferred over pickle for security (no arbitrary code exec)
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],

    # ── Timezone ──────────────────────────────────────────────────────
    timezone="UTC",
    enable_utc=True,

    # ── Task Behavior ─────────────────────────────────────────────────
    # acks_late: acknowledge AFTER task completes, not when received.
    # This means if a worker dies mid-task, the task is requeued.
    task_acks_late=True,

    # Prefetch multiplier of 1: each worker takes one task at a time.
    # Critical for LLM tasks which are long-running and should be
    # distributed evenly, not hoarded by a single worker.
    worker_prefetch_multiplier=1,

    # ── Result Expiration ─────────────────────────────────────────────
    # Results are stored in Redis for 1 hour after completion.
    # We also persist in PostgreSQL, so this is just for Celery's
    # internal result tracking.
    result_expires=3600,

    # ── Retry Policy ──────────────────────────────────────────────────
    # Global retry settings — individual tasks can override these
    task_default_retry_delay=10,
    task_max_retries=settings.CELERY_TASK_MAX_RETRIES,

    # ── Task Routes ───────────────────────────────────────────────────
    # Route evaluation tasks to a dedicated queue for scaling
    task_routes={
        "tasks.evaluation_tasks.evaluate_pitch_task": {"queue": "evaluations"},
    },
)

# ── Auto-discover tasks ──────────────────────────────────────────────────
# Celery will scan tasks/ directory for task definitions
celery_app.autodiscover_tasks(["tasks"])
