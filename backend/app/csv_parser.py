"""Safe CSV parsing and validation for cryptographic inventory uploads.

Uploaded content is only ever decoded as text and parsed with the standard
library ``csv`` module. Nothing in the file is evaluated or executed.
"""

from __future__ import annotations

import csv
import io
import re
import uuid
from dataclasses import dataclass, field

from pydantic import ValidationError

from .models import InventoryRecord, InventoryRecordIn, RowError

MAX_FILE_BYTES = 1_000_000  # 1 MB
MAX_ROWS = 2000

REQUIRED_COLUMNS = (
    "system_name",
    "algorithm",
    "purpose",
    "data_sensitivity",
    "confidentiality_years",
    "business_criticality",
    "migration_status",
)
OPTIONAL_COLUMNS = ("key_size",)

COLUMN_ALIASES: dict[str, str] = {
    "system_name": "system_name",
    "system": "system_name",
    "application": "system_name",
    "application_name": "system_name",
    "system_or_application": "system_name",
    "system_or_application_name": "system_name",
    "algorithm": "algorithm",
    "crypto_algorithm": "algorithm",
    "cryptographic_algorithm": "algorithm",
    "purpose": "purpose",
    "cryptographic_purpose": "purpose",
    "crypto_purpose": "purpose",
    "usage": "purpose",
    "key_size": "key_size",
    "key_size_bits": "key_size",
    "key_length": "key_size",
    "data_sensitivity": "data_sensitivity",
    "sensitivity": "data_sensitivity",
    "confidentiality_years": "confidentiality_years",
    "confidentiality_period": "confidentiality_years",
    "confidentiality_period_years": "confidentiality_years",
    "required_confidentiality_period": "confidentiality_years",
    "required_confidentiality_years": "confidentiality_years",
    "business_criticality": "business_criticality",
    "criticality": "business_criticality",
    "migration_status": "migration_status",
    "pqc_migration_status": "migration_status",
}


class CSVValidationError(Exception):
    """A file-level problem that prevents the CSV from being imported at all."""

    def __init__(self, status_code: int, message: str, errors: list[RowError] | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.errors = errors or []


@dataclass
class ParseResult:
    records: list[InventoryRecord] = field(default_factory=list)
    errors: list[RowError] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def _normalise_header(header: str) -> str:
    text = re.sub(r"\(.*?\)", "", header or "").strip().lower()
    return re.sub(r"[^a-z0-9]+", "_", text).strip("_")


def _decode(content: bytes) -> str:
    if b"\x00" in content:
        raise CSVValidationError(415, "The file appears to be binary, not a text CSV file.")
    for encoding in ("utf-8-sig", "cp1252"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    raise CSVValidationError(415, "The file could not be decoded as UTF-8 text.")


def parse_inventory_csv(content: bytes) -> ParseResult:
    """Parse and validate CSV bytes. Raises ``CSVValidationError`` for file-level problems."""
    if len(content) > MAX_FILE_BYTES:
        raise CSVValidationError(413, f"File is too large. The maximum size is {MAX_FILE_BYTES // 1000} KB.")
    if not content.strip():
        raise CSVValidationError(400, "The uploaded file is empty.")

    text = _decode(content)
    reader = csv.reader(io.StringIO(text, newline=""))
    try:
        raw_header = next(reader)
    except (StopIteration, csv.Error) as exc:
        raise CSVValidationError(422, "Could not read a header row from the CSV file.") from exc

    header = [_normalise_header(h) for h in raw_header]
    mapped = [COLUMN_ALIASES.get(h) for h in header]

    duplicates = sorted({m for m in mapped if m and mapped.count(m) > 1})
    if duplicates:
        raise CSVValidationError(422, f"Duplicate columns found: {', '.join(duplicates)}.")

    missing = [c for c in REQUIRED_COLUMNS if c not in mapped]
    if missing:
        raise CSVValidationError(
            422,
            "Missing required column(s): " + ", ".join(missing) + ". Download the sample CSV for the expected format.",
            [RowError(row=1, field=c, message="Required column is missing") for c in missing],
        )

    result = ParseResult()
    ignored = [raw_header[i].strip() for i, m in enumerate(mapped) if m is None and raw_header[i].strip()]
    if ignored:
        result.warnings.append(f"Ignored unrecognised column(s): {', '.join(ignored[:10])}.")
    if "key_size" not in mapped:
        result.warnings.append("No key_size column found; key sizes will be inferred from algorithm names where possible.")

    data_rows = 0
    try:
        for row in reader:
            line = reader.line_num
            if not any(cell.strip() for cell in row):
                continue
            data_rows += 1
            if data_rows > MAX_ROWS:
                raise CSVValidationError(413, f"Too many rows. The maximum is {MAX_ROWS} data rows per upload.")
            if len(row) > len(header):
                extra = row[len(header):]
                if any(cell.strip() for cell in extra):
                    result.errors.append(RowError(row=line, message=f"Row has {len(row)} values but the header has {len(header)} columns."))
                    continue
            values = {mapped[i]: row[i] for i in range(min(len(row), len(mapped))) if mapped[i]}
            try:
                record_in = InventoryRecordIn(**values)
            except ValidationError as exc:
                for err in exc.errors():
                    loc = str(err["loc"][0]) if err.get("loc") else None
                    msg = err.get("msg", "Invalid value").removeprefix("Value error, ")
                    if err.get("type") == "missing":
                        msg = "Value is required"
                    result.errors.append(RowError(row=line, field=loc, message=msg))
                continue
            result.records.append(InventoryRecord(id=uuid.uuid4().hex[:12], **record_in.model_dump()))
    except csv.Error as exc:
        raise CSVValidationError(422, f"Malformed CSV near line {reader.line_num}: {exc}.") from exc

    if data_rows == 0:
        raise CSVValidationError(422, "The CSV has a header but no data rows.")
    if not result.records:
        raise CSVValidationError(422, "No valid rows were found. Fix the errors below and upload again.", result.errors)

    unknown = sum(1 for r in result.records if not r.algorithm)
    if unknown:
        result.warnings.append(f"{unknown} row(s) have no algorithm recorded and are marked for review.")
    return result
