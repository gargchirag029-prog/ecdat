from io import BytesIO
from pathlib import Path
import zipfile

from fastapi.testclient import TestClient

from app.main import app
from app.services.analysis.pqc_engine import analyze_pqc
from app.services.analysis.risk_engine import calculate_risk
from app.services.scanner.parser import extract_key_size, extract_variant
from app.services.scanner.scanner import scan_project

SAMPLE = Path(__file__).parent / "sample_project"


def make_zip() -> bytes:
    output = BytesIO()
    with zipfile.ZipFile(output, "w") as archive:
        for path in SAMPLE.rglob("*"):
            if path.is_file():
                archive.write(path, path.relative_to(SAMPLE).as_posix())
    return output.getvalue()


def test_scanner_detects_sample_algorithms():
    files, artifacts = scan_project(SAMPLE)
    algorithms = {artifact.algorithm for artifact in artifacts}
    assert files == 6
    assert {"RSA", "ECDSA", "ECDH", "AES", "SHA", "TLS/SSL", "Certificate"} <= algorithms


def test_key_size_confidence_and_variants():
    assert extract_key_size("RSA.generate(2048)") == 2048
    assert extract_variant("SHA", "hashlib.sha256(data)") == "SHA-256"
    assert extract_variant("ECC", "ec.SECP256R1()") == "P-256"
    assert next(item for item in scan_project(SAMPLE)[1] if item.algorithm == "RSA" and item.api).confidence == "HIGH"
    assert next(item for item in scan_project(SAMPLE)[1] if item.file == "notes.py").confidence == "LOW"


def test_risk_and_pqc_are_deterministic():
    artifact = type("Artifact", (), {"algorithm": "RSA", "variant": "RSA-2048", "key_size": 2048, "confidence": "HIGH"})()
    assert calculate_risk(artifact)["level"] == "HIGH"
    assert analyze_pqc("ECDH", "P-256", None)["pqc_migration"] is True
    assert analyze_pqc("AES", "AES-256", 256)["priority"] == "LOW"


def test_api_scan_flow_and_zip_security():
    client = TestClient(app)
    response = client.post("/api/scan/upload", files={"file": ("sample.zip", make_zip(), "application/zip")})
    assert response.status_code == 201
    scan_id = response.json()["scan_id"]
    started = client.post(f"/api/scan/{scan_id}/start")
    assert started.status_code == 200
    assert started.json()["artifacts_found"] > 0
    assert client.get(f"/api/inventory/{scan_id}?algorithm=RSA").json()["total"] > 0
    assert client.get(f"/api/risks/{scan_id}").status_code == 200
    assert client.get(f"/api/pqc/{scan_id}").status_code == 200
    assert client.get(f"/api/reports/{scan_id}/cbom").json()["cbom_version"] == "0.1"

    unsafe = BytesIO()
    with zipfile.ZipFile(unsafe, "w") as archive:
        archive.writestr("../escape.py", "RSA.generate(2048)")
    blocked = client.post("/api/scan/upload", files={"file": ("unsafe.zip", unsafe.getvalue(), "application/zip")})
    assert blocked.status_code == 400
