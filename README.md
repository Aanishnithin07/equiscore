# EquiScore Platform

EquiScore is an auditable AI platform eliminating bias and opacity in hackathon judging. It offers dynamic submission validation, automated evaluation scoring using sophisticated prompt extraction rubrics, continuous analytics tracking with SciPy distributions, and deep real-time feedback bridging via WebSockets.

---

## 🚀 Local Development Setup

To test the application locally effortlessly with all background queuing, databases, and caches configured automatically:

```bash
docker-compose up -d --build
```
> Running this boots out Postgres equipped with pgvector, Redis, FastAPI engines mapping live hot-reloads, and Celery tracking endpoints natively.

## 🔐 Environment Variables

Reference the root `.env.example` explicitly which sets mock identifiers bypassing explicit constraints natively:
- `DATABASE_URL`: Connection bridge mapping to `postgresql+asyncpg`
- `OPENAI_API_KEY`: Required AI Engine matrix extraction API
- `SECRET_KEY`: Used securely generating JWT signatures implicitly
- `SENDGRID_API_KEY`: (Optional) Transports templates natively otherwise relies on SMTP setups.
- `SENTRY_DSN`: (Optional) Connects stack-traces into analytical interfaces manually.

## 🛡 API Endpoints Reference 

The application utilizes strict REST principles guarded fully utilizing RBAC access keys injected safely via Bearer JWT formats natively. Below are primary hubs:

### Authentication
- `POST /api/v1/auth/login`: Issue dual token responses
- `POST /api/v1/auth/register`: Generate users globally safely

### Evaluations
- `POST /api/v1/evaluation/pitch`: Securely extracts multipart `.pdf` mappings against track expectations
- `GET /api/v1/evaluation/{job_id}`: Track exact evaluation progress states manually

### Administration & Safety
- `GET /api/v1/audit/{hackathon_id}/bias-report`: Return SciPy Pearson testing checking algorithmic parity.
- `GET /api/v1/plagiarism/{hackathon_id}/report`: Returns Vector comparisons exceeding cosine boundaries cleanly.

*For all 25+ endpoints see the auto-generated Swagger UI exposed dynamically at `/docs` upon boot.*

## 🐳 Deployment Guide

Deployment is entirely orchestrated via structured zero-trust Docker files pushing natively via GitHub CI/CD:

1. Push feature commits targeting `main`.
2. The Action pipeline `ci.yml` strictly enforces testing and security traces (Trivy).
3. Post test confirmation, `deploy.yml` triggers pushing multi-stage builds automatically routing them globally.
4. NGINX Reverse Proxies strictly proxy all HTTP traffic securely through rate limiting endpoints cleanly maintaining Websocket heartbeats securely up to 24h explicitly.

## 📐 Architecture Decisions

- **FastAPI / AsyncPG**: Maximum network throughput scaling vertically on limited compute architectures smoothly handling file uploads implicitly.
- **Celery + Redis Hub**: Background evaluation tasks consume AI API tokens smoothly preventing rate limits on main threads cleanly. Redis natively handles message fan-out for real-time WebSocket state distributions natively.
- **React + Zustand**: Minimal client-side footprint eliminating heavy global contexts favoring localized atomic interactions (Query mapping smoothly).
- **SciPy / Vector Storage**: Eliminates traditional naive rules testing instead offering dense semantic mathematics proving objectivity empirically to organizers dynamically.
