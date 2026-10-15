"""Thread-safe in-memory inventory store, seeded with fictional sample data.

Data lives only in process memory and is discarded on restart. No uploaded
data is written to disk.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from .csv_parser import parse_inventory_csv
from .models import Finding, InventoryRecord
from .risk_engine import assess_inventory

SAMPLE_CSV_PATH = Path(__file__).parent / "data" / "sample_inventory.csv"
SAMPLE_LABEL = "Fictional sample inventory (for demonstration only)"


@dataclass(frozen=True)
class InventorySnapshot:
    source: str
    source_label: str
    updated_at: datetime
    records: list[InventoryRecord]
    findings: list[Finding]


class InventoryStore:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._snapshot: InventorySnapshot | None = None
        self.load_sample()

    def load_sample(self) -> InventorySnapshot:
        records = parse_inventory_csv(SAMPLE_CSV_PATH.read_bytes()).records
        return self.replace(records, "sample", SAMPLE_LABEL)

    def replace(self, records: list[InventoryRecord], source: str, label: str) -> InventorySnapshot:
        snapshot = InventorySnapshot(
            source=source,
            source_label=label,
            updated_at=datetime.now(timezone.utc),
            records=list(records),
            findings=assess_inventory(records),
        )
        with self._lock:
            self._snapshot = snapshot
        return snapshot

    def get(self) -> InventorySnapshot:
        with self._lock:
            assert self._snapshot is not None
            return self._snapshot


store = InventoryStore()
