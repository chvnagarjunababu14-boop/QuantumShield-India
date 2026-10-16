from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_http_200() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_payload_matches_contract() -> None:
    response = client.get("/api/health")
    assert response.json() == {
        "status": "ok",
        "service": "QuantumShield India",
    }


def test_root_returns_service_information() -> None:
    response = client.get("/")
    assert response.status_code == 200

    body = response.json()
    assert body["name"] == "QuantumShield India"
    assert body["version"] == "0.1.0"
    assert body["phase"] == "1"
    assert isinstance(body["description"], str)
    assert body["description"].strip()
