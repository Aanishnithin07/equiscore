# EquiScore Backend Dockerfile
# ==============================
# Multi-stage build for the FastAPI application.
# Also used by the Celery worker (same image, different CMD).

FROM python:3.12-slim

# ── System Dependencies ──────────────────────────────────────────────────
# libpq-dev: PostgreSQL client library (for asyncpg / psycopg2)
# libmagic1: File magic byte detection (python-magic)
# build-essential: Compilation tools for C extensions
# libpango, libcairo, etc: Required by WeasyPrint for PDF generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libmagic1 \
    build-essential \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# ── Working Directory ────────────────────────────────────────────────────
WORKDIR /app

# ── Install Python Dependencies ──────────────────────────────────────────
# Copy requirements first for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Copy Application Code ────────────────────────────────────────────────
COPY . .

# ── Expose Port ──────────────────────────────────────────────────────────
EXPOSE 8000

# ── Default Command (overridden in docker-compose for celery worker) ─────
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
