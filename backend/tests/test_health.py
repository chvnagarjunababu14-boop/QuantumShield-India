import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.config import Settings, load_settings
from app.main import create_app

LOCAL_ORIGIN = "http://127.0.0.1:5173"


def _client(origins: str = LOCAL_ORIGIN) -> TestClient:
    return TestClient(create_app(Settings(cors_origins=origins)))


def test_health_returns_service_status() -> None:
    response = _client().get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "QuantumShield India"}


def test_cors_allows_the_local_frontend_origin() -> None:
    response = _client().get("/api/health", headers={"Origin": LOCAL_ORIGIN})

    assert response.headers["access-control-allow-origin"] == LOCAL_ORIGIN


def test_cors_preflight_allows_get_from_the_frontend() -> None:
    response = _client().options(
        "/api/health",
        headers={
            "Origin": LOCAL_ORIGIN,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Accept",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == LOCAL_ORIGIN
    assert "GET" in response.headers["access-control-allow-methods"]


def test_cors_does_not_reflect_an_unknown_origin() -> None:
    response = _client().get(
        "/api/health",
        headers={"Origin": "https://unknown.example"},
    )

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


def test_localhost_and_loopback_origins_are_both_allowed() -> None:
    client = _client("http://localhost:5173,http://127.0.0.1:5173")

    for origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
        response = client.get("/api/health", headers={"Origin": origin})
        assert response.headers["access-control-allow-origin"] == origin


def test_wildcard_cors_origin_is_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(cors_origins="*")


def test_load_settings_reads_cors_origins(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:5173")

    settings = load_settings()

    assert settings.allowed_origins == ["http://localhost:5173"]


def test_security_headers_are_present() -> None:
    response = _client().get("/api/health")

    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "geolocation=()" in response.headers["permissions-policy"]
    assert "no-store" in response.headers["cache-control"]


def test_unhandled_exception_returns_clean_json_error() -> None:
    app = create_app()

    @app.get("/api/test-error")
    def trigger_error() -> None:
        raise RuntimeError("Sensitive internal database connection error: db://internal-host:5432")

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/api/test-error")

    assert response.status_code == 500
    data = response.json()
    assert data["status"] == "error"
    assert "Sensitive internal database" not in response.text
    assert data["message"] == "An internal server error occurred."


