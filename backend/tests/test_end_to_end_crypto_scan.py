import io
import zipfile

from fastapi.testclient import TestClient

from app.main import app
from app.services.scanner.signature_engine import scan_text

AES256GCM_PAYLOAD = (
    "EOE1.eyJ2IjoxLCJhbGciOiJBMjU2R0NNIiwia2RmIjoiUEJLREYyIiwiaGFzaCI6IlNIQS0yNTYiLCJpdGVyIjo2MDAwMDAsInNhbHQiOiJvWFZmMWNqWDFuel96YW43QjQxLTJBIiwiaXYiOiJUUUVQX0k5S3RUTTF3M3hHIiwidGFnIjoxMjgsImVuYyI6IlVURi04IiwiY3QiOiJCbFRoc2xiV2hCdDFwdkJrWUIzT2JpOUgyQ1JJM0VaRnMyU3hJWktvIn0"
)


def make_zip() -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("project/aes256gcm_test.txt", AES256GCM_PAYLOAD)
    return buffer.getvalue()


def test_scan_text_detects_decoded_aes256gcm_metadata():
    findings = scan_text(AES256GCM_PAYLOAD, "aes256gcm_test.txt")
    assert any(item.get("algorithm") == "AES-256-GCM" for item in findings)
    assert any(item.get("algorithm") == "PBKDF2" for item in findings)
    assert any(item.get("algorithm") == "SHA-256" for item in findings)
    aes = next(item for item in findings if item.get("algorithm") == "AES-256-GCM")
    assert aes.get("detection_method") == "decoded_metadata"
    assert float(aes.get("confidence", 0)) >= 0.95


def test_end_to_end_zip_upload_scan_detects_aes256gcm():
    client = TestClient(app)
    upload = client.post(
        "/api/scan/upload",
        files={"file": ("project.zip", make_zip(), "application/zip")},
    )
    assert upload.status_code == 201, upload.text
    scan_id = upload.json()["scan_id"]

    started = client.post(f"/api/scan/{scan_id}/start")
    assert started.status_code == 200, started.text
    body = started.json()
    assert body["files_scanned"] >= 1
    assert body["artifacts_found"] >= 1

    inventory = client.get(f"/api/inventory/{scan_id}")
    assert inventory.status_code == 200, inventory.text
    items = inventory.json()["items"]
    algorithms = {item["algorithm"] for item in items}
    assert "AES-256-GCM" in algorithms
    assert "PBKDF2" in algorithms
    assert "SHA-256" in algorithms

    aes = next(item for item in items if item["algorithm"] == "AES-256-GCM")
    assert aes["file"].endswith("aes256gcm_test.txt")
    assert aes["line"] == 1
    assert aes["confidence"] in {"HIGH", "MEDIUM", "LOW"}


def test_common_config_and_extensionless_text_files_are_scanned(tmp_path):
    env_path = tmp_path / ".env"
    env_path.write_text(
        'alg=A256GCM\n',
        encoding="utf-8",
    )
    config_path = tmp_path / "app.config"
    config_path.write_text(
        'kdf=PBKDF2\nhash=SHA-256\n',
        encoding="utf-8",
    )
    extensionless = tmp_path / "secrets"
    extensionless.write_text(
        'AES-256-GCM\ncreateCipheriv(key, "aes-256-gcm", iv);\n',
        encoding="utf-8",
    )

    files_scanned, artifacts = __import__("app.services.scanner.scanner", fromlist=["scan_project"]).scan_project(tmp_path)
    assert files_scanned >= 3
    algorithms = {artifact.algorithm for artifact in artifacts}
    assert "AES-256-GCM" in algorithms
    assert "PBKDF2" in algorithms
