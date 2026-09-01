from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_encryption_analysis_for_aes_gcm():
    response = client.post("/api/encryption/analyze", json={"algorithm": "AES-GCM"})
    assert response.status_code == 200
    body = response.json()
    assert body["algorithm"] == "AES-GCM"
    assert body["status"] == "recommended"
    assert body["risk_score"] == 10
    assert body["security_level"] == "strong"


def test_encryption_analysis_for_aes_256_cbc():
    response = client.post("/api/encryption/analyze", json={"algorithm": "AES-256-CBC"})
    assert response.status_code == 200
    body = response.json()
    assert body["algorithm"] == "AES-256-CBC"
    assert body["status"] == "legacy"
    assert body["risk_score"] == 35
    assert body["security_level"] == "strong with proper implementation"


def test_encryption_analysis_for_3des():
    response = client.post("/api/encryption/analyze", json={"algorithm": "3DES"})
    assert response.status_code == 200
    body = response.json()
    assert body["algorithm"] == "3DES"
    assert body["status"] == "legacy/deprecated"
    assert body["risk_score"] == 90
    assert body["security_level"] == "weak/obsolete"


def test_encryption_analysis_rejects_unsupported_algorithm():
    response = client.post("/api/encryption/analyze", json={"algorithm": "ChaCha20"})
    assert response.status_code == 400
    assert response.json()["error"] == "Unsupported encryption algorithm"
