import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.store import SAMPLE_CSV_PATH, store

client = TestClient(app)

HEADER = ("system_name,algorithm,purpose,key_size,data_sensitivity,confidentiality_years,"
          "business_criticality,migration_status\n")


@pytest.fixture(autouse=True)
def reset_store():
    store.load_sample()
    yield
    store.load_sample()


def upload(content: bytes | str, filename: str = "inventory.csv", content_type: str = "text/csv"):
    if isinstance(content, str):
        content = content.encode()
    return client.post("/api/inventory/upload", files={"file": (filename, content, content_type)})


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_dashboard_uses_labelled_sample():
    r = client.get("/api/dashboard")
    assert r.status_code == 200
    body = r.json()
    assert body["source"] == "sample"
    assert "Fictional" in body["source_label"]
    s = body["summary"]
    assert s["total_dependencies"] == 22
    assert s["requiring_review"] > 0
    assert s["high_priority"] > 0
    assert 0 <= s["readiness"]["percent"] <= 100


def test_inventory_and_report():
    inv = client.get("/api/inventory").json()
    assert len(inv["records"]) == len(inv["findings"]) == 22
    rep = client.get("/api/report").json()
    assert set(rep["findings_by_priority"]) == {"critical", "high", "medium", "low", "informational"}
    assert rep["migration_checklist"]
    assert "not a complete scan" in rep["disclaimer"]


def test_sample_csv_download():
    r = client.get("/api/inventory/sample-csv")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/csv")
    assert r.content == SAMPLE_CSV_PATH.read_bytes()


def test_valid_upload_replaces_inventory():
    csv = HEADER + "My App,RSA-2048,TLS key exchange,2048,high,10,critical,not_started\n" \
                   "My App,AES-256-GCM,Disk encryption,256,low,1,low,completed\n"
    r = upload(csv)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["imported_count"] == 2
    assert body["rejected_count"] == 0
    assert body["source"] == "upload"
    assert client.get("/api/dashboard").json()["summary"]["total_dependencies"] == 2


def test_upload_with_aliases_and_bom():
    csv = ("\ufeffSystem,Cryptographic Algorithm,Cryptographic Purpose,Key Length,Sensitivity,"
           "Required Confidentiality Period (years),Criticality,Migration Status\n"
           "App,ECDSA,Code signing,256,Confidential,5 years,High,In Progress\n")
    r = upload(csv)
    assert r.status_code == 200, r.text
    rec = r.json()["records"][0]
    assert rec["data_sensitivity"] == "high"
    assert rec["migration_status"] == "in_progress"
    assert rec["confidentiality_years"] == 5


def test_partial_upload_reports_row_errors():
    csv = HEADER + "Good,RSA,Key exchange,,high,5,high,planned\n" \
                   "Bad,RSA,Key exchange,big,extreme,-1,high,planned\n"
    r = upload(csv)
    assert r.status_code == 200
    body = r.json()
    assert body["imported_count"] == 1
    assert body["rejected_count"] == 1
    fields = {e["field"] for e in body["errors"]}
    assert {"key_size", "data_sensitivity", "confidentiality_years"} <= fields
    assert all(e["row"] == 3 for e in body["errors"])


def test_empty_file():
    r = upload(b"")
    assert r.status_code == 400
    assert "empty" in r.json()["detail"]["message"]


def test_header_only():
    r = upload(HEADER)
    assert r.status_code == 422
    assert "no data rows" in r.json()["detail"]["message"]


def test_missing_columns():
    r = upload("system_name,algorithm\nApp,RSA\n")
    assert r.status_code == 422
    detail = r.json()["detail"]
    assert "Missing required column" in detail["message"]
    assert any(e["field"] == "purpose" for e in detail["errors"])


def test_all_rows_invalid():
    r = upload(HEADER + ",RSA,,,nope,abc,zzz,maybe\n")
    assert r.status_code == 422
    assert r.json()["detail"]["errors"]


def test_malformed_too_many_values():
    r = upload(HEADER + "App,RSA,Key exchange,2048,high,5,high,planned,extra,values\n")
    assert r.status_code == 422


def test_unsupported_extension():
    r = upload(b"%PDF-1.4", filename="report.pdf", content_type="application/pdf")
    assert r.status_code == 415


def test_unsupported_content_type():
    r = upload(HEADER, filename="x.csv", content_type="image/png")
    assert r.status_code == 415


def test_binary_content_rejected():
    r = upload(b"\x89PNG\r\n\x1a\n\x00\x00\x00", filename="x.csv")
    assert r.status_code == 415


def test_file_too_large():
    row = "App,RSA,Key exchange,2048,high,5,high,planned\n"
    r = upload(HEADER + row * 25000)
    assert r.status_code == 413


def test_upload_does_not_execute_or_alter_markup():
    payload = '<script>alert(1)</script>'
    r = upload(HEADER + f'"{payload}",RSA,Key exchange,2048,high,5,high,planned\n')
    assert r.status_code == 200
    assert r.json()["records"][0]["system_name"] == payload


def test_failed_upload_keeps_previous_inventory():
    upload(b"")
    assert client.get("/api/inventory").json()["source"] == "sample"


def test_reset_restores_sample():
    upload(HEADER + "App,RSA,Key exchange,2048,high,5,high,planned\n")
    r = client.post("/api/inventory/reset")
    assert r.status_code == 200
    assert r.json()["source"] == "sample"


def test_stateless_assessment():
    body = {"records": [
        {"system_name": "A", "algorithm": "RSA-2048", "purpose": "Key exchange", "data_sensitivity": "high",
         "confidentiality_years": 10, "business_criticality": "high", "migration_status": "not_started"},
        {"system_name": "B", "algorithm": "SHA-256", "purpose": "Integrity", "data_sensitivity": "low",
         "confidentiality_years": 0, "business_criticality": "low", "migration_status": "completed"},
    ]}
    r = client.post("/api/assessment", json=body)
    assert r.status_code == 200
    statuses = {f["system_name"]: f["quantum_status"] for f in r.json()["findings"]}
    assert statuses == {"A": "vulnerable", "B": "low_concern"}
    assert client.get("/api/inventory").json()["source"] == "sample"


def test_assessment_without_body_uses_current_inventory():
    r = client.post("/api/assessment")
    assert r.status_code == 200
    assert r.json()["assessed_count"] == 22


def test_assessment_validation_error():
    r = client.post("/api/assessment", json={"records": [{"system_name": "A"}]})
    assert r.status_code == 422
    assert r.json()["detail"]["errors"]


def test_assessment_empty_list():
    r = client.post("/api/assessment", json={"records": []})
    assert r.status_code == 400


def test_cors_restricted_to_frontend_origin():
    ok = client.options("/api/health", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"})
    assert ok.headers.get("access-control-allow-origin") == "http://localhost:5173"
    bad = client.get("/api/health", headers={"Origin": "http://evil.example"})
    assert "access-control-allow-origin" not in bad.headers
