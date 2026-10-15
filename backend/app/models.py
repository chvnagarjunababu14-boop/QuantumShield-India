"""Pydantic models shared by the API, CSV parser and risk engine."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Sensitivity = Literal["low", "medium", "high", "critical"]
Criticality = Literal["low", "medium", "high", "critical"]
MigrationStatus = Literal["not_started", "planned", "in_progress", "completed", "unknown"]

QuantumStatus = Literal[
    "vulnerable",
    "classically_weak",
    "unknown",
    "reduced_margin",
    "low_concern",
    "quantum_resistant",
]
Priority = Literal["critical", "high", "medium", "low", "informational"]

PRIORITY_ORDER: list[str] = ["critical", "high", "medium", "low", "informational"]

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b-\x1f\x7f]")

_SENSITIVITY_ALIASES = {
    "public": "low",
    "low": "low",
    "internal": "medium",
    "medium": "medium",
    "moderate": "medium",
    "confidential": "high",
    "high": "high",
    "restricted": "critical",
    "secret": "critical",
    "critical": "critical",
    "very high": "critical",
}

_CRITICALITY_ALIASES = {
    "low": "low",
    "medium": "medium",
    "moderate": "medium",
    "high": "high",
    "critical": "critical",
    "mission critical": "critical",
    "very high": "critical",
}

_MIGRATION_ALIASES = {
    "not started": "not_started",
    "not_started": "not_started",
    "none": "not_started",
    "planned": "planned",
    "planning": "planned",
    "in progress": "in_progress",
    "in_progress": "in_progress",
    "ongoing": "in_progress",
    "completed": "completed",
    "complete": "completed",
    "done": "completed",
    "migrated": "completed",
    "unknown": "unknown",
    "": "unknown",
}


def clean_text(value: object) -> str:
    """Strip whitespace and control characters from user-supplied text."""
    if value is None:
        return ""
    return _CONTROL_CHARS.sub("", str(value)).strip()


def _normalise_choice(value: object, aliases: dict[str, str], field: str) -> str:
    text = clean_text(value).lower().replace("-", " ").replace("_", " ")
    text = re.sub(r"\s+", " ", text)
    if text in aliases:
        return aliases[text]
    allowed = sorted(set(aliases.values()))
    raise ValueError(f"'{clean_text(value)}' is not a valid {field}; expected one of: {', '.join(allowed)}")


class InventoryRecordIn(BaseModel):
    """A single cryptographic dependency as supplied by a user (CSV row or JSON)."""

    model_config = ConfigDict(str_max_length=200)

    system_name: str = Field(min_length=1, max_length=120)
    algorithm: str = Field(default="", max_length=120)
    purpose: str = Field(min_length=1, max_length=120)
    key_size: int | None = Field(default=None, ge=1, le=65536)
    data_sensitivity: Sensitivity
    confidentiality_years: float = Field(ge=0, le=100)
    business_criticality: Criticality
    migration_status: MigrationStatus = "unknown"

    @field_validator("system_name", "algorithm", "purpose", mode="before")
    @classmethod
    def _clean_strings(cls, value: object) -> str:
        return clean_text(value)

    @field_validator("key_size", mode="before")
    @classmethod
    def _parse_key_size(cls, value: object) -> object:
        text = clean_text(value).lower()
        if text in {"", "n/a", "na", "none", "-"}:
            return None
        text = text.removesuffix("bits").removesuffix("bit").strip()
        try:
            return int(float(text))
        except ValueError as exc:
            raise ValueError(f"key size '{clean_text(value)}' must be a whole number of bits or blank") from exc

    @field_validator("confidentiality_years", mode="before")
    @classmethod
    def _parse_years(cls, value: object) -> object:
        if isinstance(value, (int, float)):
            return value
        text = clean_text(value).lower()
        text = re.sub(r"\s*(years?|yrs?|y)$", "", text)
        if text == "":
            raise ValueError("confidentiality period is required (number of years, use 0 if not applicable)")
        try:
            return float(text)
        except ValueError as exc:
            raise ValueError(f"confidentiality period '{clean_text(value)}' must be a number of years") from exc

    @field_validator("data_sensitivity", mode="before")
    @classmethod
    def _parse_sensitivity(cls, value: object) -> str:
        return _normalise_choice(value, _SENSITIVITY_ALIASES, "data sensitivity")

    @field_validator("business_criticality", mode="before")
    @classmethod
    def _parse_criticality(cls, value: object) -> str:
        return _normalise_choice(value, _CRITICALITY_ALIASES, "business criticality")

    @field_validator("migration_status", mode="before")
    @classmethod
    def _parse_migration(cls, value: object) -> str:
        return _normalise_choice(value, _MIGRATION_ALIASES, "migration status")


class InventoryRecord(InventoryRecordIn):
    id: str


class Finding(BaseModel):
    record_id: str
    system_name: str
    algorithm: str
    purpose: str
    purpose_category: str
    key_size: int | None
    algorithm_family: str
    quantum_status: QuantumStatus
    quantum_status_label: str
    requires_review: bool
    priority: Priority
    risk_score: int = Field(ge=0, le=100)
    explanation: str
    reasons: list[str]
    recommended_action: str


class RowError(BaseModel):
    row: int | None = Field(description="1-based CSV line number (header is line 1)")
    field: str | None = None
    message: str


class InventoryResponse(BaseModel):
    source: Literal["sample", "upload"]
    source_label: str
    updated_at: datetime
    records: list[InventoryRecord]
    findings: list[Finding]


class UploadResponse(InventoryResponse):
    imported_count: int
    rejected_count: int
    errors: list[RowError]
    warnings: list[str]


class AssessmentRequest(BaseModel):
    records: list[InventoryRecordIn] | None = Field(
        default=None,
        max_length=2000,
        description="Records to assess without storing them. If omitted, the current inventory is assessed.",
    )


class AssessmentResponse(BaseModel):
    assessed_count: int
    findings: list[Finding]
    summary: dict[str, object]
