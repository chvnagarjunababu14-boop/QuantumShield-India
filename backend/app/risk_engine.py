"""Transparent, rule-based quantum-risk assessment engine.

The engine works in two clearly separated stages:

1. Algorithm-level classification (``classify_algorithm``) answers
   "how does this *algorithm* fare against known quantum attacks?".
   It does not depend on the business context.
2. System-level prioritisation (``assess_record``) combines that
   classification with data sensitivity, confidentiality period, business
   criticality and migration status to decide how urgently the
   dependency should be reviewed.

This module makes no prediction of *when* a cryptographically relevant
quantum computer will exist. It only applies documented rules.
"""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass, field

from .models import PRIORITY_ORDER, Finding, InventoryRecord

QUANTUM_STATUS_LABELS: dict[str, str] = {
    "vulnerable": "Quantum-vulnerable (Shor's algorithm)",
    "classically_weak": "Classically weak or deprecated",
    "unknown": "Unknown - needs review",
    "reduced_margin": "Reduced security margin (Grover's algorithm)",
    "low_concern": "Low quantum concern",
    "quantum_resistant": "Designed to resist known quantum attacks",
}

REVIEW_STATUSES = {"vulnerable", "classically_weak", "unknown", "reduced_margin"}


@dataclass(frozen=True)
class AlgorithmProfile:
    family: str
    category: str  # public_key | symmetric | hash | pqc | hybrid | unknown
    quantum_status: str
    notes: tuple[str, ...] = field(default_factory=tuple)
    classical_weakness: bool = False


# ---------------------------------------------------------------------------
# Algorithm-level classification
# ---------------------------------------------------------------------------

_PQC_TOKENS = ("ML-KEM", "MLKEM", "KYBER", "ML-DSA", "MLDSA", "DILITHIUM", "SLH-DSA", "SLHDSA",
               "SPHINCS", "FN-DSA", "FNDSA", "FALCON", "XMSS", "HQC", "FRODO", "CLASSIC-MCELIECE")
_PQC_EXACT = re.compile(r"(^|[^A-Z])(LMS|HSS)([^A-Z]|$)")
_ECC_TOKENS = ("ECDSA", "ECDH", "ECIES", "ECMQV", "EDDSA", "ED25519", "ED448", "X25519", "X448",
               "CURVE25519", "CURVE448", "SECP", "PRIME256", "BRAINPOOL", "P-256", "P-384", "P-521",
               "P256", "P384", "P521", "ECC", "ELLIPTIC")
_DLOG_PATTERN = re.compile(r"(^|[^A-Z])(DH|DHE|FFDHE\d*|DSA|ELGAMAL)([^A-Z]|\d|$)|DIFFIE")
_CLASSICALLY_BROKEN_SYMMETRIC = {"DES": "DES", "RC4": "RC4", "RC2": "RC2", "BLOWFISH": "Blowfish"}
_TRIPLE_DES = ("3DES", "TDES", "TDEA", "TRIPLEDES", "TRIPLE-DES", "DESEDE", "DES-EDE")
_MODERN_SYMMETRIC = ("AES", "CHACHA20", "CAMELLIA", "ARIA", "SM4", "TWOFISH", "SERPENT")
_BROKEN_HASHES = ("MD5", "MD4", "SHA-1", "SHA1", "SHA-0", "RIPEMD-128")
_PASSWORD_HASHES = ("BCRYPT", "SCRYPT", "ARGON2", "PBKDF2")
_UNKNOWN_VALUES = {"", "UNKNOWN", "N/A", "NA", "NONE", "-", "?", "TBD", "OTHER", "PROPRIETARY", "CUSTOM"}


def _normalise_algorithm(name: str) -> str:
    return re.sub(r"[\s_/]+", "-", name.strip().upper())


def _infer_bits(name: str, key_size: int | None) -> int | None:
    """Return an explicit key size, or one embedded in the algorithm name (e.g. AES-256)."""
    if key_size:
        return key_size
    match = re.search(r"(\d{3,4})", name)
    return int(match.group(1)) if match else None


def classify_algorithm(algorithm: str | None, key_size: int | None = None) -> AlgorithmProfile:
    """Classify an algorithm on its own merits, independent of business context."""
    name = _normalise_algorithm(algorithm or "")

    if name in _UNKNOWN_VALUES:
        return AlgorithmProfile(
            "Unknown / not specified", "unknown", "unknown",
            ("No algorithm was recorded, so it cannot be classified automatically.",),
        )

    has_pqc = any(token in name for token in _PQC_TOKENS) or bool(_PQC_EXACT.search(name))
    # Remove PQC names first so that e.g. "ML-DSA" is not mistaken for classical DSA.
    classical_part = name
    for token in _PQC_TOKENS:
        classical_part = classical_part.replace(token, " ")
    has_ecc = any(token in classical_part for token in _ECC_TOKENS)
    has_rsa = "RSA" in classical_part
    has_dlog = bool(_DLOG_PATTERN.search(classical_part))

    # Post-quantum and hybrid schemes
    if has_pqc and (has_ecc or has_rsa or has_dlog):
        return AlgorithmProfile(
            "Hybrid (classical + post-quantum)", "hybrid", "quantum_resistant",
            ("Combines a classical and a post-quantum algorithm; remains protected as long as the "
             "post-quantum component holds.",),
        )
    if has_pqc:
        return AlgorithmProfile(
            "Post-quantum cryptography", "pqc", "quantum_resistant",
            ("Belongs to a family designed to resist known quantum attacks (e.g. NIST FIPS 203/204/205).",),
        )

    # Classical public-key cryptography: all broken by Shor's algorithm on a CRQC.
    if has_ecc:
        return AlgorithmProfile(
            "Elliptic-curve cryptography", "public_key", "vulnerable",
            ("Security rests on the elliptic-curve discrete-logarithm problem, which Shor's algorithm "
             "solves efficiently on a sufficiently capable fault-tolerant quantum computer.",),
        )
    if has_rsa:
        notes = ["Security rests on integer factorisation, which Shor's algorithm solves efficiently on a "
                 "sufficiently capable fault-tolerant quantum computer. Larger keys do not fix this."]
        rsa_bits = re.search(r"RSA-?(\d{3,5})", name)
        bits = key_size or (int(rsa_bits.group(1)) if rsa_bits else None)
        if bits and bits < 2048:
            notes.append(f"RSA-{bits} is also below today's classical minimum of 2048 bits.")
            return AlgorithmProfile("RSA", "public_key", "vulnerable", tuple(notes), classical_weakness=True)
        return AlgorithmProfile("RSA", "public_key", "vulnerable", tuple(notes))
    if has_dlog:
        return AlgorithmProfile(
            "Finite-field Diffie-Hellman / DSA", "public_key", "vulnerable",
            ("Security rests on the finite-field discrete-logarithm problem, which Shor's algorithm "
             "solves efficiently on a sufficiently capable fault-tolerant quantum computer.",),
        )

    # Symmetric ciphers
    if any(token in name for token in _TRIPLE_DES):
        return AlgorithmProfile(
            "Symmetric cipher", "symmetric", "classically_weak",
            ("Triple DES has a 64-bit block size and is deprecated by NIST; replace it regardless of "
             "quantum computing.",),
        )
    for token, label in _CLASSICALLY_BROKEN_SYMMETRIC.items():
        if re.search(rf"(^|[^A-Z]){token}([^A-Z]|$)", name):
            return AlgorithmProfile(
                "Symmetric cipher", "symmetric", "classically_weak",
                (f"{label} is already weak against classical attacks; this is a present-day risk, "
                 "not a quantum one.",),
            )
    if any(token in name for token in _MODERN_SYMMETRIC):
        bits = 256 if "CHACHA20" in name else _infer_bits(name, key_size)
        grover = ("Grover's algorithm offers at most a quadratic speed-up against symmetric keys, "
                  "roughly halving the effective key strength; it does not break the cipher outright.")
        if bits is None:
            return AlgorithmProfile(
                "Symmetric cipher", "symmetric", "reduced_margin",
                (grover, "Key size is not recorded; confirm whether 128-bit or 256-bit keys are used."),
            )
        if bits < 192:
            return AlgorithmProfile(
                "Symmetric cipher", "symmetric", "reduced_margin",
                (grover, f"A {bits}-bit key has a reduced margin for data that must stay confidential "
                         "for many years; 256-bit keys are generally recommended for long-term protection."),
            )
        return AlgorithmProfile(
            "Symmetric cipher", "symmetric", "low_concern",
            (grover, f"A {bits}-bit key retains a comfortable security margin against known quantum attacks."),
        )

    # Hash functions and password hashing
    if any(token in name for token in _BROKEN_HASHES):
        return AlgorithmProfile(
            "Hash function", "hash", "classically_weak",
            ("This hash function has practical classical collision attacks and is deprecated for most "
             "security uses; this is independent of quantum computing.",),
        )
    if any(token in name for token in _PASSWORD_HASHES):
        return AlgorithmProfile(
            "Password hashing / KDF", "hash", "low_concern",
            ("Password-hashing functions are not structurally broken by known quantum algorithms; "
             "use strong parameters and unique salts.",),
        )
    if re.search(r"SHA-?2|SHA-?3|SHA-?(224|256|384|512)|BLAKE2|BLAKE3|SHAKE", name):
        bits = _infer_bits(re.sub(r"SHA-?3", "SHA", name), None)
        if bits is not None and bits < 256:
            return AlgorithmProfile(
                "Hash function", "hash", "reduced_margin",
                (f"A {bits}-bit output has a reduced margin against generic quantum search; "
                 "prefer 256-bit or larger outputs for long-term use.",),
            )
        return AlgorithmProfile(
            "Hash function", "hash", "low_concern",
            ("Modern hash functions with 256-bit or larger outputs are not broken by known quantum "
             "algorithms; generic quantum speed-ups leave a comfortable margin.",),
        )

    return AlgorithmProfile(
        "Unrecognised algorithm", "unknown", "unknown",
        (f"'{algorithm}' is not in the rule set. It is flagged for manual review, not assumed vulnerable.",),
    )


# ---------------------------------------------------------------------------
# Purpose classification
# ---------------------------------------------------------------------------

# Rules are evaluated in order: explicit purposes win over protocol names (e.g. "TLS certificate signing"
# is a signature, "VPN tunnel encryption" is encryption). Short acronyms must match as whole words.
_PURPOSE_RULES: list[tuple[str, re.Pattern[str]]] = [
    ("password_storage", re.compile(r"\bpassword|\bcredential hash")),
    ("digital_signature", re.compile(r"\bsign|\bcertificate|\bfirmware|\battest|\b(pki|ca)\b")),
    ("key_exchange", re.compile(r"\bkey (exchange|agreement|transport|wrap|encapsulation|establishment)"
                                r"|\bhandshake|\b(kex|kem)\b")),
    ("encryption", re.compile(r"\bencrypt|\bat rest|\bstorage|\bbackup|\bdatabase|\bdisk|\bfile|\barchive"
                              r"|\bconfidential|\btransit")),
    ("authentication", re.compile(r"\bauth|\blogin|\bidentity|\btoken|\b(sso|jwt|mfa|otp|saml|oidc)\b")),
    ("integrity", re.compile(r"\bhash|\bintegrity|\bchecksum|\bdigest|\bfingerprint|\b(mac|hmac)\b")),
    ("key_exchange", re.compile(r"\b(tls|ssl|vpn|ipsec|ssh)\b")),
]

_PURPOSE_LABELS = {
    "key_exchange": "Key exchange / transport",
    "encryption": "Data encryption",
    "digital_signature": "Digital signature",
    "authentication": "Authentication",
    "integrity": "Integrity / hashing",
    "password_storage": "Password storage",
    "other": "Other / unspecified",
}


def classify_purpose(purpose: str) -> str:
    text = purpose.lower()
    for category, pattern in _PURPOSE_RULES:
        if pattern.search(text):
            return category
    return "other"


def purpose_label(category: str) -> str:
    return _PURPOSE_LABELS.get(category, category)


# ---------------------------------------------------------------------------
# System-level prioritisation
# ---------------------------------------------------------------------------

BASE_SCORES = {
    "classically_weak": 50,
    "vulnerable": 45,
    "unknown": 30,
    "reduced_margin": 15,
    "low_concern": 5,
    "quantum_resistant": 0,
}
SENSITIVITY_WEIGHTS = {"low": 0, "medium": 5, "high": 10, "critical": 15}
CRITICALITY_WEIGHTS = {"low": 0, "medium": 4, "high": 8, "critical": 12}
MIGRATION_WEIGHTS = {"not_started": 10, "planned": 6, "unknown": 6, "in_progress": 3, "completed": 0}
PRIORITY_THRESHOLDS = [(80, "critical"), (60, "high"), (40, "medium"), (20, "low"), (0, "informational")]
# Algorithm classifications that cannot be escalated above this score by context alone.
SCORE_CAPS = {"low_concern": 15, "quantum_resistant": 10, "reduced_margin": 55}

_CONFIDENTIALITY_PURPOSES = {"key_exchange", "encryption", "other"}


def _confidentiality_weight(years: float) -> int:
    if years >= 10:
        return 18
    if years >= 5:
        return 12
    if years >= 2:
        return 6
    return 0


def score_to_priority(score: int) -> str:
    for threshold, label in PRIORITY_THRESHOLDS:
        if score >= threshold:
            return label
    return "informational"


def _recommended_action(profile: AlgorithmProfile, purpose_category: str, record: InventoryRecord) -> str:
    status = profile.quantum_status
    if status == "classically_weak":
        return ("Replace now: this is a present-day classical weakness. Move to AES-256-GCM or "
                "ChaCha20-Poly1305 for encryption and SHA-256/SHA-3 for hashing, then re-assess.")
    if status == "unknown":
        return ("Confirm the actual algorithm, key size and cryptographic library with the system owner or "
                "vendor, update the inventory, and re-run the assessment.")
    if status == "vulnerable":
        if purpose_category in {"digital_signature", "authentication"}:
            action = ("Plan migration of signatures to ML-DSA (FIPS 204) or SLH-DSA (FIPS 205). Map certificate "
                      "chains, HSM and vendor support, and design for crypto-agility.")
        else:
            action = ("Plan migration of key establishment to ML-KEM (FIPS 203), ideally in a hybrid mode "
                      "(e.g. X25519 + ML-KEM-768) during transition. Confirm library and protocol support.")
        if record.confidentiality_years >= 5 and purpose_category in _CONFIDENTIALITY_PURPOSES:
            action += " Treat as urgent because long-lived data is exposed to 'harvest now, decrypt later'."
        if profile.classical_weakness:
            action = "Immediately raise the key size to at least RSA-3072 as an interim fix. " + action
        if record.migration_status == "completed":
            action += " The record says migration is complete yet lists a vulnerable algorithm - verify the inventory."
        return action
    if status == "reduced_margin":
        if profile.category == "hash":
            return "Prefer SHA-256, SHA-384 or SHA-3 for long-term integrity protection during the next upgrade cycle."
        return ("Consider 256-bit keys (e.g. AES-256-GCM) where data must stay confidential for many years. "
                "No emergency migration is implied by known quantum attacks.")
    if status == "quantum_resistant":
        return ("Verify that a maintained, well-reviewed library and standardised parameter sets are used, "
                "and keep monitoring standards guidance.")
    return ("No quantum-specific migration is needed at algorithm level. Keep the dependency in the inventory "
            "and maintain crypto-agility.")


def assess_record(record: InventoryRecord) -> Finding:
    profile = classify_algorithm(record.algorithm, record.key_size)
    purpose_category = classify_purpose(record.purpose)
    status = profile.quantum_status
    reasons: list[str] = list(profile.notes)

    score = BASE_SCORES[status]

    if profile.category == "public_key" and purpose_category == "integrity":
        purpose_category = "digital_signature"

    sens = SENSITIVITY_WEIGHTS[record.data_sensitivity]
    crit = CRITICALITY_WEIGHTS[record.business_criticality]
    mig = MIGRATION_WEIGHTS[record.migration_status]
    score += sens + crit + mig

    if profile.classical_weakness:
        score += 10

    conf = 0
    if status in {"vulnerable", "unknown", "reduced_margin"}:
        if purpose_category in _CONFIDENTIALITY_PURPOSES:
            conf = _confidentiality_weight(record.confidentiality_years)
            if status == "reduced_margin":
                conf //= 2
            if conf and status == "vulnerable":
                reasons.append(
                    f"Data must remain confidential for {record.confidentiality_years:g} years; traffic or "
                    "ciphertext captured today could be decrypted later ('harvest now, decrypt later')."
                )
        elif purpose_category in {"digital_signature", "authentication"} and record.confidentiality_years >= 10:
            conf = 6
            reasons.append("Long-lived signatures or credentials may need to remain trustworthy for many years.")
    score += conf

    if record.data_sensitivity in {"high", "critical"}:
        reasons.append(f"Data sensitivity is {record.data_sensitivity}.")
    if record.business_criticality in {"high", "critical"}:
        reasons.append(f"Business criticality is {record.business_criticality}.")
    if status in REVIEW_STATUSES and record.migration_status in {"not_started", "unknown"}:
        reasons.append(f"Migration status is '{record.migration_status.replace('_', ' ')}'.")

    if status in SCORE_CAPS and score > SCORE_CAPS[status]:
        score = SCORE_CAPS[status]
        reasons.append("Priority is capped because the algorithm itself is not a significant quantum concern.")

    score = max(0, min(100, score))
    priority = score_to_priority(score)

    explanation = (
        f"Algorithm level: {profile.family} is classified as '{QUANTUM_STATUS_LABELS[status]}'. "
        f"System level: used for {purpose_label(purpose_category).lower()} with {record.data_sensitivity} "
        f"sensitivity data and {record.business_criticality} business criticality, giving a "
        f"{priority} review priority (score {score}/100)."
    )

    return Finding(
        record_id=record.id,
        system_name=record.system_name,
        algorithm=record.algorithm or "(not specified)",
        purpose=record.purpose,
        purpose_category=purpose_category,
        key_size=record.key_size,
        algorithm_family=profile.family,
        quantum_status=status,  # type: ignore[arg-type]
        quantum_status_label=QUANTUM_STATUS_LABELS[status],
        requires_review=status in REVIEW_STATUSES,
        priority=priority,  # type: ignore[arg-type]
        risk_score=score,
        explanation=explanation,
        reasons=reasons,
        recommended_action=_recommended_action(profile, purpose_category, record),
    )


def assess_inventory(records: list[InventoryRecord]) -> list[Finding]:
    findings = [assess_record(r) for r in records]
    findings.sort(key=lambda f: (PRIORITY_ORDER.index(f.priority), -f.risk_score, f.system_name.lower()))
    return findings


def summarise(records: list[InventoryRecord], findings: list[Finding]) -> dict[str, object]:
    priority_counts = Counter(f.priority for f in findings)
    status_counts = Counter(f.quantum_status for f in findings)
    family_counts = Counter(f.algorithm_family for f in findings)
    migration_counts = Counter(r.migration_status for r in records)

    total = len(findings)
    migration_by_id = {r.id: r.migration_status for r in records}
    ready = sum(1 for f in findings if is_ready(f.quantum_status, migration_by_id[f.record_id]))
    in_motion = sum(
        1 for f in findings
        if f.requires_review and migration_by_id[f.record_id] in {"planned", "in_progress"}
    )
    readiness_pct = round(100 * ready / total) if total else 0
    if total == 0:
        readiness_label = "No data"
    elif readiness_pct >= 80:
        readiness_label = "Advanced"
    elif readiness_pct >= 50:
        readiness_label = "Progressing"
    elif readiness_pct >= 25:
        readiness_label = "Developing"
    else:
        readiness_label = "Early stage"

    return {
        "total_dependencies": total,
        "total_systems": len({r.system_name.strip().lower() for r in records}),
        "requiring_review": sum(1 for f in findings if f.requires_review),
        "quantum_vulnerable": status_counts.get("vulnerable", 0),
        "high_priority": priority_counts.get("critical", 0) + priority_counts.get("high", 0),
        "priority_counts": {p: priority_counts.get(p, 0) for p in PRIORITY_ORDER},
        "quantum_status_counts": {s: status_counts.get(s, 0) for s in QUANTUM_STATUS_LABELS},
        "algorithm_family_counts": dict(family_counts.most_common()),
        "migration_status_counts": {
            s: migration_counts.get(s, 0) for s in ("not_started", "planned", "in_progress", "completed", "unknown")
        },
        "readiness": {
            "percent": readiness_pct,
            "label": readiness_label,
            "ready_count": ready,
            "migration_in_progress_count": in_motion,
            "definition": (
                "Share of inventoried dependencies that are either not a significant quantum concern at algorithm "
                "level or whose migration is recorded as complete. Indicative only; not a certification."
            ),
        },
    }


def is_ready(quantum_status: str, migration_status: str) -> bool:
    """A dependency counts towards readiness if it needs no quantum migration or its migration is complete."""
    if quantum_status in {"low_concern", "quantum_resistant"}:
        return True
    return quantum_status in {"vulnerable", "reduced_margin", "classically_weak"} and migration_status == "completed"
