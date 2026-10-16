"""Phase 1 HTTP API for QuantumShield India."""

import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

API_VERSION = "0.1.0"
SERVICE_NAME = "QuantumShield India"
DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"


class HealthResponse(BaseModel):
    status: str = Field(examples=["ok"])
    service: str = Field(examples=[SERVICE_NAME])


class ServiceInfo(BaseModel):
    name: str
    version: str
    phase: str
    description: str


def allowed_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(
    title=SERVICE_NAME,
    version=API_VERSION,
    summary="Phase 1 foundation API for the QuantumShield India dashboard.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled %s on %s", type(exc).__name__, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred."},
    )


@app.get("/", response_model=ServiceInfo)
def read_service_info() -> ServiceInfo:
    return ServiceInfo(
        name=SERVICE_NAME,
        version=API_VERSION,
        phase="1",
        description=(
            "Quantum-safe cybersecurity awareness and cryptographic readiness "
            "platform. Phase 1 provides the application foundation and API health check."
        ),
    )


@app.get("/api/health", response_model=HealthResponse)
def read_health() -> HealthResponse:
    return HealthResponse(status="ok", service=SERVICE_NAME)
