"""QuantumShield India - FastAPI application."""

from __future__ import annotations

import os
from datetime import datetime, timezone

from fastapi import FastAPI, File, HTTPException, Request, UploadFile, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from . import __version__
from .csv_parser import MAX_FILE_BYTES, CSVValidationError, parse_inventory_csv
from .models import (
    AssessmentRequest,
    AssessmentResponse,
    InventoryRecord,
    InventoryResponse,
    UploadResponse,
)
from .report import DISCLAIMER, build_report
from .risk_engine import assess_inventory, summarise
from .store import SAMPLE_CSV_PATH, InventorySnapshot, store

MAX_ERRORS_RETURNED = 200
ALLOWED_CONTENT_TYPES = {
    "text/csv",
    "application/csv",
    "text/plain",
    "application/vnd.ms-excel",
    "application/octet-stream",
    "",
}

app = FastAPI(
    title="QuantumShield India API",
    version=__version__,
    description=(
        "Educational quantum-risk assessment API. Assessments are rule-based and derived only from "
        "user-supplied inventories; they are not a complete infrastructure scan or a certification."
    ),
)

_origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins.split(",") if o.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(RequestValidationError)
async def _validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [
        {
            "row": None,
            "field": ".".join(str(p) for p in err.get("loc", []) if p != "body"),
            "message": str(err.get("msg", "Invalid value")).removeprefix("Value error, "),
        }
        for err in exc.errors()[:MAX_ERRORS_RETURNED]
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={"detail": {"message": "Request validation failed.", "errors": errors}},
    )


def _inventory_payload(snapshot: InventorySnapshot) -> dict[str, object]:
    return {
        "source": snapshot.source,
        "source_label": snapshot.source_label,
        "updated_at": snapshot.updated_at,
        "records": snapshot.records,
        "findings": snapshot.findings,
    }


@app.get("/api/health", tags=["system"])
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "quantumshield-india-api",
        "version": __version__,
        "time": datetime.now(timezone.utc),
    }


@app.get("/api/dashboard", tags=["dashboard"])
def dashboard() -> dict[str, object]:
    snapshot = store.get()
    findings = snapshot.findings
    recent = [f for f in findings if f.requires_review][:6]
    return {
        "source": snapshot.source,
        "source_label": snapshot.source_label,
        "updated_at": snapshot.updated_at,
        "summary": summarise(snapshot.records, findings),
        "top_findings": recent,
        "disclaimer": DISCLAIMER,
    }


@app.get("/api/inventory", response_model=InventoryResponse, tags=["inventory"])
def get_inventory() -> dict[str, object]:
    return _inventory_payload(store.get())


@app.post("/api/inventory/upload", response_model=UploadResponse, tags=["inventory"])
async def upload_inventory(file: UploadFile = File(...)) -> dict[str, object]:
    filename = (file.filename or "").strip()
    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={"message": "Unsupported file type. Please upload a .csv file.", "errors": []},
        )
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={"message": f"Unsupported content type '{content_type}'. Please upload a CSV file.", "errors": []},
        )

    content = await file.read(MAX_FILE_BYTES + 1)
    try:
        result = parse_inventory_csv(content)
    except CSVValidationError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail={
                "message": exc.message,
                "errors": [e.model_dump() for e in exc.errors[:MAX_ERRORS_RETURNED]],
            },
        ) from exc

    rejected_rows = {e.row for e in result.errors}
    warnings = list(result.warnings)
    if len(result.errors) > MAX_ERRORS_RETURNED:
        warnings.append(f"Only the first {MAX_ERRORS_RETURNED} of {len(result.errors)} errors are shown.")

    snapshot = store.replace(result.records, "upload", f"Uploaded file: {filename[:80]}")
    return {
        **_inventory_payload(snapshot),
        "imported_count": len(result.records),
        "rejected_count": len(rejected_rows),
        "errors": result.errors[:MAX_ERRORS_RETURNED],
        "warnings": warnings,
    }


@app.post("/api/inventory/reset", response_model=InventoryResponse, tags=["inventory"])
def reset_inventory() -> dict[str, object]:
    return _inventory_payload(store.load_sample())


@app.get("/api/inventory/sample-csv", tags=["inventory"])
def sample_csv() -> FileResponse:
    return FileResponse(SAMPLE_CSV_PATH, media_type="text/csv", filename="quantumshield_sample_inventory.csv")


@app.post("/api/assessment", response_model=AssessmentResponse, tags=["assessment"])
def run_assessment(payload: AssessmentRequest | None = None) -> dict[str, object]:
    """Assess supplied records statelessly, or re-assess the current inventory when none are supplied."""
    if payload is None or payload.records is None:
        snapshot = store.get()
        records, findings = snapshot.records, snapshot.findings
    else:
        if not payload.records:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Provide at least one record to assess.", "errors": []},
            )
        records = [InventoryRecord(id=f"adhoc-{i + 1}", **r.model_dump()) for i, r in enumerate(payload.records)]
        findings = assess_inventory(records)
    return {"assessed_count": len(findings), "findings": findings, "summary": summarise(records, findings)}


@app.get("/api/report", tags=["report"])
def report() -> dict[str, object]:
    return build_report(store.get())
