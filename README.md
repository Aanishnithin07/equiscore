# EquiScore

**EquiScore** is an Auditable AI platform designed to eliminate bias and opacity in hackathon judging. It acts as a "Pro-Level Judge's Copilot" during the live pitching stage. 

Hackathon judges use the tablet-optimized frontend to view live leaderboard rankings and receive AI-generated technical evaluations of pitch decks, complete with rubric breakdowns and suggested Q&A. Crucially, the platform enforces human-in-the-loop validation, allowing judges to override AI scores while recording definitive, immutable audit trails.

## 🚀 Architecture

The project consists of three main systems interacting asynchronously:

1. **Backend API (`FastAPI`)**: Handles file uploading, state management, and real-time polling endpoints.
2. **Task Workers (`Celery` + `Redis`)**: Securely handles PDF extraction (`PyMuPDF`) and calls out to OpenAI (`gpt-4o`) while enforcing strict JSON response schematics to evaluate track-specific rubrics.
3. **Frontend Dashboard (`React 18` + `Tailwind` + `Framer Motion`)**: A dark-mode, glassmorphism UI using Zustand for fast local judge-override caching and React Query for polling live scores. Data is visualized via custom SVGs.

*Data is durably stored in PostgreSQL 16 utilizing JSONB columns for the LLM audit trails.*

---

## 🛠️ Local Development Setup

### 1. Backend Setup

The backend relies on PostgreSQL, Redis, and OpenAI. The easiest way to get started is using the provided Docker compose file for infrastructure.

```bash
cd backend
cp .env.example .env
# Important: Fill in your OPENAI_API_KEY inside the new .env file

# Start the infrastructure and the backend natively (or use docker for everything)
docker-compose up -d postgres redis

# Native python setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start API
uvicorn main:app --reload --port 8000

# Open a new terminal to start the Celery worker
celery -A tasks.celery_app worker --loglevel=info
```

### 2. Frontend Setup

The frontend expects the backend to be running on `http://localhost:8000`.

```bash
cd frontend
cp .env.example .env

npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the dashboard.

## 🗄️ Component Structure

### Track-Aware Engine
Pitches are evaluated strictly against predefined rubrics based on their track (e.g., *Healthcare*, *AI/ML*, *Open Innovation*). The LLM is forced to return deterministic weights and scores.

### Auditability
Every score override by a human judge requires explicitly clicking the `LOCK IN SCORE` button, which averages the AI's pre-score with the Human's intuition score and writes a permanent log to the database alongside the Judge's private validation notes.
