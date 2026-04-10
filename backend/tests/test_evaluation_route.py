"""
EquiScore Tests — Evaluation Route Tests
==========================================
Tests for the POST /evaluate-pitch and GET /evaluation/{job_id} endpoints.
Uses httpx.AsyncClient and pytest-asyncio for async testing.
"""

from __future__ import annotations

import io
import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from main import app


@pytest_asyncio.fixture
async def client():
    """Create an async test client for the FastAPI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_submit_evaluation_invalid_file_type(client: AsyncClient) -> None:
    """Test that uploading a non-PDF/PPTX file returns 400."""
    # Create a fake JPEG file
    fake_file = io.BytesIO(b"\xff\xd8\xff\xe0fake jpeg content")

    response = await client.post(
        "/api/v1/evaluate-pitch",
        data={"team_name": "TestTeam", "track": "healthcare"},
        files={"pitch_file": ("test.jpg", fake_file, "image/jpeg")},
    )

    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


@pytest.mark.asyncio
async def test_submit_evaluation_empty_file(client: AsyncClient) -> None:
    """Test that uploading an empty file returns 400."""
    empty_file = io.BytesIO(b"")

    response = await client.post(
        "/api/v1/evaluate-pitch",
        data={"team_name": "TestTeam", "track": "ai_ml"},
        files={"pitch_file": ("empty.pdf", empty_file, "application/pdf")},
    )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_submit_evaluation_magic_bytes_mismatch(client: AsyncClient) -> None:
    """Test that a file with valid MIME but wrong magic bytes returns 400."""
    # Send a file with PDF MIME type but JPEG magic bytes
    fake_pdf = io.BytesIO(b"\xff\xd8\xff\xe0" + b"0" * 100)

    response = await client.post(
        "/api/v1/evaluate-pitch",
        data={"team_name": "TestTeam", "track": "healthcare"},
        files={"pitch_file": ("deck.pdf", fake_pdf, "application/pdf")},
    )

    assert response.status_code == 400
    assert "magic bytes" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_evaluation_not_found(client: AsyncClient) -> None:
    """Test that polling with a non-existent job_id returns 404."""
    fake_job_id = uuid.uuid4()

    response = await client.get(f"/api/v1/evaluation/{fake_job_id}")

    assert response.status_code == 404
    assert "No evaluation found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    """Test the health check endpoint returns 200 with correct body."""
    response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "EquiScore"
