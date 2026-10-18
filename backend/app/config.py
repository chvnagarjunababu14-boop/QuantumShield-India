from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVICE_NAME = "QuantumShield India"
DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """Process configuration. Phase 1 only needs CORS origins."""

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE if _ENV_FILE.is_file() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    cors_origins: str = DEFAULT_CORS_ORIGINS

    @field_validator("cors_origins")
    @classmethod
    def normalize_cors_origins(cls, value: str) -> str:
        origins = [item.strip() for item in value.split(",") if item.strip()]
        if not origins:
            raise ValueError("CORS_ORIGINS must list at least one origin")
        if "*" in origins:
            raise ValueError("CORS_ORIGINS must not use a wildcard")
        return ",".join(origins)

    @property
    def allowed_origins(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


def load_settings() -> Settings:
    return Settings()
