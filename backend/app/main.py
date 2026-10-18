from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import SERVICE_NAME, Settings, load_settings
from app.schemas import HealthResponse


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = load_settings() if settings is None else settings
    app = FastAPI(title=SERVICE_NAME, version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "OPTIONS"],
        allow_headers=["Accept"],
    )

    @app.get("/api/health", response_model=HealthResponse)
    def read_health() -> HealthResponse:
        return HealthResponse(status="ok", service=SERVICE_NAME)

    return app


app = create_app()
