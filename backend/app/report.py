"""Builds the Quantum-Safe Readiness Report from the current inventory."""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone

from .models import PRIORITY_ORDER
from .risk_engine import summarise
from .store import InventorySnapshot

DISCLAIMER = (
    "This report is generated from a user-supplied inventory using transparent, rule-based heuristics. "
    "It is not a complete scan of any organisation's infrastructure, is not a certified security "
    "assessment, and does not guarantee that any system is quantum-safe. It makes no prediction of "
    "when a cryptographically relevant quantum computer will exist."
)

MIGRATION_CHECKLIST = [
    {"phase": "Discover", "item": "Extend the cryptographic inventory beyond this CSV: certificates, libraries, HSMs, protocols, vendor products and embedded devices."},
    {"phase": "Discover", "item": "Record owners, data classifications and how long each data set must stay confidential."},
    {"phase": "Prioritise", "item": "Address classically weak algorithms (e.g. SHA-1, 3DES, RSA-1024) first - they are a present-day risk."},
    {"phase": "Prioritise", "item": "Rank quantum-vulnerable key establishment protecting long-lived sensitive data ('harvest now, decrypt later')."},
    {"phase": "Plan", "item": "Ask vendors and cloud providers for their post-quantum roadmaps and supported standards (FIPS 203/204/205)."},
    {"phase": "Plan", "item": "Design for crypto-agility: centralise crypto configuration so algorithms can be swapped without rewrites."},
    {"phase": "Pilot", "item": "Pilot hybrid key exchange (classical + ML-KEM) in a non-production environment and measure performance."},
    {"phase": "Pilot", "item": "Test post-quantum signatures (ML-DSA / SLH-DSA) with your PKI, certificate sizes and constrained devices."},
    {"phase": "Migrate", "item": "Migrate in priority order, using maintained, validated libraries - never custom cryptography."},
    {"phase": "Govern", "item": "Re-assess the inventory regularly and track migration status to completion."},
]


def build_report(snapshot: InventorySnapshot) -> dict[str, object]:
    findings = snapshot.findings
    summary = summarise(snapshot.records, findings)
    grouped = {p: [f.model_dump() for f in findings if f.priority == p] for p in PRIORITY_ORDER}

    action_counter = Counter(f.recommended_action.split(".")[0] for f in findings if f.requires_review)
    next_actions = [{"action": action, "count": count} for action, count in action_counter.most_common(6)]

    return {
        "title": "Quantum-Safe Readiness Report",
        "generated_at": datetime.now(timezone.utc),
        "source": snapshot.source,
        "source_label": snapshot.source_label,
        "inventory_updated_at": snapshot.updated_at,
        "disclaimer": DISCLAIMER,
        "summary": summary,
        "findings_by_priority": grouped,
        "next_actions": next_actions,
        "migration_checklist": MIGRATION_CHECKLIST,
    }
