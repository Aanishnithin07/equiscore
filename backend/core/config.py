"""
EquiScore Application Configuration
====================================
Uses pydantic-settings to load all configuration from environment variables
and .env file. SecretStr is used for sensitive values like API keys to
prevent accidental logging.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration for the EquiScore backend.

    All values are loaded from environment variables or the .env file at the
    project root. Defaults are provided for non-sensitive, development-safe values.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────────────────
    # Must use asyncpg driver format: postgresql+asyncpg://user:pass@host/db
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL connection URL in asyncpg format",
        examples=["postgresql+asyncpg://equiscore:equiscore@localhost:5432/equiscore"],
    )

    # ── Redis ─────────────────────────────────────────────────────────────
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis URL for Celery broker and result backend",
    )

    # ── OpenAI ────────────────────────────────────────────────────────────
    # SecretStr prevents the key from appearing in logs or repr()
    from pydantic import SecretStr

    OPENAI_API_KEY: SecretStr = Field(
        ...,
        description="OpenAI API key for GPT-4o and Whisper access",
    )
    OPENAI_MODEL: str = Field(
        default="gpt-4o",
        description="OpenAI model identifier for evaluation calls",
    )

    # ── File Uploads ──────────────────────────────────────────────────────
    MAX_FILE_SIZE_MB: int = Field(
        default=50,
        ge=1,
        le=200,
        description="Maximum allowed file upload size in megabytes",
    )

    # ── Celery ────────────────────────────────────────────────────────────
    CELERY_TASK_MAX_RETRIES: int = Field(
        default=3,
        ge=0,
        le=10,
        description="Maximum number of retries for failed Celery tasks",
    )

    # ── Security & Authentication ─────────────────────────────────────────
    SECRET_KEY: SecretStr = Field(
        ...,
        min_length=32,
        description="Secret key for JWT generation",
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        description="JWT access token expiry in minutes",
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7,
        description="JWT refresh token expiry in days",
    )
    ALGORITHM: str = Field(
        default="HS256",
        description="JWT signing algorithm",
    )
    BCRYPT_ROUNDS: int = Field(
        default=12,
        description="Bcrypt hashing rounds",
    )

    # ── Logging ───────────────────────────────────────────────────────────
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)",
    )

    # ── Application ───────────────────────────────────────────────────────
    APP_NAME: str = Field(
        default="EquiScore",
        description="Application name for logging and metadata",
    )
    APP_VERSION: str = Field(
        default="1.0.0",
        description="Application version string",
    )
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:5173"],
        description="Allowed CORS origins for frontend access",
    )

    @property
    def max_file_size_bytes(self) -> int:
        """Convert MB limit to bytes for validation checks."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


# Singleton instance — import this across the application
settings = Settings()
