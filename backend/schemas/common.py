"""
EquiScore Common Schemas
=========================
Reusable response models shared across all API routes.
"""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

# Generic type for paginated response payloads
T = TypeVar("T")


class ErrorResponse(BaseModel):
    """
    Standard error response body returned for all 4xx/5xx responses.

    Mirrors FastAPI's HTTPException detail format but adds a structured
    error_code field for programmatic error handling on the frontend.
    """

    detail: str = Field(
        ...,
        description="Human-readable error message",
        examples=["File exceeds the 50MB size limit"],
    )
    error_code: str = Field(
        ...,
        description="Machine-readable error code for frontend mapping",
        examples=["FILE_TOO_LARGE"],
    )


class JobStatusResponse(BaseModel):
    """
    Minimal job status response for lightweight polling endpoints.

    Used when the client only needs to know if a job is done,
    without fetching the full evaluation payload.
    """

    job_id: str = Field(
        ...,
        description="The job identifier",
    )
    status: str = Field(
        ...,
        description="Current status: pending, processing, completed, or failed",
    )
    message: str = Field(
        default="",
        description="Optional human-readable status message",
    )


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response wrapper.

    Usage:
        PaginatedResponse[LeaderboardEntry](
            items=[...],
            total=42,
            limit=20,
            offset=0,
        )
    """

    items: list[T] = Field(
        ...,
        description="Page of results",
    )
    total: int = Field(
        ...,
        ge=0,
        description="Total number of items across all pages",
    )
    limit: int = Field(
        ...,
        ge=1,
        le=100,
        description="Maximum items per page",
    )
    offset: int = Field(
        ...,
        ge=0,
        description="Number of items skipped from the start",
    )

    @property
    def has_more(self) -> bool:
        """Whether there are more pages after this one."""
        return self.offset + self.limit < self.total
