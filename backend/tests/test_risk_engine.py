import pytest

from app.models import InventoryRecord
from app.risk_engine import assess_record, classify_algorithm, classify_purpose


def make_record(**overrides) -> InventoryRecord:
    base = {
        "id": "t1",
        "system_name": "Test System",
        "algorithm": "RSA-2048",
        "purpose": "Key exchange",
        "key_size": None,
        "data_sensitivity": "high",
        "confidentiality_years": 10,
        "business_criticality": "high",
        "migration_status": "not_started",
    }
    base.update(overrides)
    return InventoryRecord(**base)


@pytest.mark.parametrize("alg", ["RSA-2048", "RSA", "RSA-OAEP", "RSASSA-PSS", "SHA256withRSA", "rsa 4096"])
def test_rsa_is_quantum_vulnerable(alg):
    profile = classify_algorithm(alg)
    assert profile.family == "RSA"
    assert profile.quantum_status == "vulnerable"
    assert not profile.classical_weakness


def test_small_rsa_also_flags_classical_weakness():
    assert classify_algorithm("RSA-1024").classical_weakness
    assert classify_algorithm("RSA", key_size=1024).classical_weakness


@pytest.mark.parametrize("alg", ["ECDSA-P256", "ECDHE", "X25519", "Ed25519", "secp256k1", "ECC P-384", "EdDSA"])
def test_elliptic_curve_is_quantum_vulnerable(alg):
    profile = classify_algorithm(alg)
    assert profile.family == "Elliptic-curve cryptography"
    assert profile.quantum_status == "vulnerable"


@pytest.mark.parametrize("alg", ["DH-2048", "DHE", "FFDHE2048", "DSA", "Diffie-Hellman"])
def test_finite_field_public_key_is_vulnerable(alg):
    assert classify_algorithm(alg).quantum_status == "vulnerable"


@pytest.mark.parametrize("alg,status", [
    ("AES-256-GCM", "low_concern"),
    ("AES-256", "low_concern"),
    ("ChaCha20-Poly1305", "low_concern"),
    ("AES-128-CBC", "reduced_margin"),
    ("AES", "reduced_margin"),
])
def test_symmetric_is_not_classified_like_public_key(alg, status):
    profile = classify_algorithm(alg)
    assert profile.category == "symmetric"
    assert profile.quantum_status == status
    assert profile.quantum_status != "vulnerable"


def test_aes_key_size_column_is_used():
    assert classify_algorithm("AES-GCM", key_size=256).quantum_status == "low_concern"
    assert classify_algorithm("AES-GCM", key_size=128).quantum_status == "reduced_margin"


@pytest.mark.parametrize("alg", ["3DES", "DES", "RC4"])
def test_legacy_symmetric_is_classically_weak(alg):
    assert classify_algorithm(alg).quantum_status == "classically_weak"


@pytest.mark.parametrize("alg,status", [
    ("SHA-256", "low_concern"),
    ("SHA-384", "low_concern"),
    ("SHA3-256", "low_concern"),
    ("HMAC-SHA256", "low_concern"),
    ("SHA-224", "reduced_margin"),
    ("SHA-1", "classically_weak"),
    ("MD5", "classically_weak"),
    ("bcrypt", "low_concern"),
])
def test_hashes_are_assessed_separately(alg, status):
    profile = classify_algorithm(alg)
    assert profile.category == "hash"
    assert profile.quantum_status == status


@pytest.mark.parametrize("alg", ["", "unknown", "N/A", "ProprietaryCipherX", "  "])
def test_unknown_algorithms_need_review_not_vulnerable(alg):
    profile = classify_algorithm(alg)
    assert profile.quantum_status == "unknown"
    assert profile.quantum_status != "vulnerable"


@pytest.mark.parametrize("alg,category", [
    ("ML-KEM-768", "pqc"),
    ("Kyber768", "pqc"),
    ("ML-DSA-65", "pqc"),
    ("SLH-DSA-SHA2-128s", "pqc"),
    ("X25519MLKEM768", "hybrid"),
])
def test_post_quantum_algorithms(alg, category):
    profile = classify_algorithm(alg)
    assert profile.category == category
    assert profile.quantum_status == "quantum_resistant"


@pytest.mark.parametrize("purpose,category", [
    ("TLS key exchange", "key_exchange"),
    ("TLS server certificate signing", "digital_signature"),
    ("VPN tunnel encryption", "encryption"),
    ("Database encryption at rest", "encryption"),
    ("Password storage", "password_storage"),
    ("Machine learning pipeline", "other"),
    ("Authentication tokens", "authentication"),
])
def test_purpose_classification(purpose, category):
    assert classify_purpose(purpose) == category


def test_finding_contains_required_fields():
    f = assess_record(make_record())
    assert f.algorithm == "RSA-2048"
    assert f.purpose == "Key exchange"
    assert f.quantum_status == "vulnerable"
    assert f.priority in {"critical", "high"}
    assert f.explanation and f.recommended_action and f.reasons
    assert "ML-KEM" in f.recommended_action
    assert "Algorithm level" in f.explanation and "System level" in f.explanation


def test_context_changes_system_priority_not_algorithm_status():
    severe = assess_record(make_record(data_sensitivity="critical", business_criticality="critical",
                                       confidentiality_years=20, migration_status="not_started"))
    mild = assess_record(make_record(data_sensitivity="low", business_criticality="low",
                                     confidentiality_years=0, migration_status="completed"))
    assert severe.quantum_status == mild.quantum_status == "vulnerable"
    assert severe.risk_score > mild.risk_score
    assert severe.priority == "critical"
    assert mild.priority in {"medium", "low"}


def test_long_confidentiality_mentions_harvest_now_decrypt_later():
    f = assess_record(make_record(confidentiality_years=15))
    assert any("harvest now, decrypt later" in r for r in f.reasons)


def test_low_concern_is_capped_even_with_severe_context():
    f = assess_record(make_record(algorithm="AES-256-GCM", data_sensitivity="critical",
                                  business_criticality="critical", confidentiality_years=30))
    assert f.priority in {"low", "informational"}
    assert not f.requires_review


def test_signature_recommends_ml_dsa():
    f = assess_record(make_record(algorithm="ECDSA-P256", purpose="Code signing"))
    assert "ML-DSA" in f.recommended_action


def test_unknown_recommends_confirmation():
    f = assess_record(make_record(algorithm=""))
    assert f.quantum_status == "unknown"
    assert f.requires_review
    assert "Confirm" in f.recommended_action
