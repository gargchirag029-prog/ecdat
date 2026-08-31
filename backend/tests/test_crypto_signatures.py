from app.services.scanner.signature_engine import scan_text


def test_detects_aes_and_rsa_api_calls():
    source = '''
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms

rsa_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
'''
    findings = scan_text(source, file_name="sample.py")
    algorithms = {item["algorithm"] for item in findings}
    assert "RSA" in algorithms
    assert any(item["algorithm"] == "AES" and item["detection_method"] in {"api_signature", "api_call"} for item in findings)


def test_detects_sha256_hash_and_ecdsa_keygen():
    source = '''
import hashlib
from cryptography.hazmat.primitives.asymmetric import ec

hash_value = hashlib.sha256(data)
key = ec.generate_private_key(ec.SECP256R1())
'''
    findings = scan_text(source, file_name="crypto.py")
    algorithms = {item["algorithm"] for item in findings}
    assert "SHA-256" in algorithms
    assert any(item["algorithm"] in {"ECDSA", "ECC"} for item in findings)


def test_detects_pbkdf2_metadata_payload():
    payload = (
        "EOE1.eyJ2IjoxLCJhbGciOiJBMjU2R0NNIiwia2RmIjoiUEJLREYyIiwiaGFzaCI6IlNIQS0yNTYiLCJpdGVyIjo2MDAwMDAsInNhbHQiOiJvWFZmMWNqWDFuel96YW43QjQxLTJBIiwiaXYiOiJUUUVQX0k5S3RUTTF3M3hHIiwidGFnIjoxMjgsImVuYyI6IlVURi04IiwiY3QiOiJCbFRoc2xiV2hCdDFwdkJrWUIzT2JpOUgyQ1JJM0VaRnMyU3hJWktvIn0"
    )
    findings = scan_text(payload, file_name="encrypted.txt")
    algorithms = {item["algorithm"] for item in findings}
    evidence = "\n".join(item.get("evidence", "") for item in findings)
    assert "AES-256-GCM" in algorithms
    assert "PBKDF2" in algorithms
    assert "SHA-256" in algorithms
    assert "600000" in evidence
    assert "salt" in evidence.lower()
    assert "iv" in evidence.lower() or "nonce" in evidence.lower()
    assert "tag" in evidence.lower() or "auth" in evidence.lower()


def test_detects_pem_private_key_artifact():
    pem = '''-----BEGIN RSA PRIVATE KEY-----
MIIBOgIBAAJBAJQ77v0m4x1W1k9H9xI6f9Ww7e2nD+M=
-----END RSA PRIVATE KEY-----
'''
    findings = scan_text(pem, file_name="key.pem")
    assert any(item["artifact_type"] == "PEM_PRIVATE_KEY" for item in findings)
    assert any(item["algorithm"] == "RSA" for item in findings)


def test_direct_aes_256_gcm_aliases_are_detected():
    for text in [
        "Encryption Algorithm: AES-256-GCM",
        "Encryption Algorithm: AES256-GCM",
        "Encryption Algorithm: AES256GCM",
        "Encryption Algorithm: A256GCM",
        "Encryption Algorithm: aes-256-gcm",
    ]:
        findings = scan_text(text, file_name="test_crypto.txt")
        assert any(item["algorithm"] == "AES-256-GCM" for item in findings)


def test_detects_aes_256_gcm_api_calls():
    source = '''
createCipheriv("aes-256-gcm", key, iv)
Cipher(algorithms.AES(key), modes.GCM(iv))
Cipher.getInstance("AES/GCM/NoPadding")
'''
    findings = scan_text(source, file_name="crypto.txt")
    assert any(item["algorithm"] == "AES-256-GCM" and item["detection_method"] in {"api_signature", "decoded_metadata", "direct_signature"} for item in findings)


def test_detects_aes_256_gcm_encoded_metadata():
    payload = (
        "EOE1.eyJ2IjoxLCJhbGciOiJBMjU2R0NNIiwia2RmIjoiUEJLREYyIiwiaGFzaCI6IlNIQS0yNTYiLCJpdGVyIjo2MDAwMDAsInNhbHQiOiJvWFZmMWNqWDFuel96YW43QjQxLTJBIiwiaXYiOiJUUUVQX0k5S3RUTTF3M3hHIiwidGFnIjoxMjgsImVuYyI6IlVURi04IiwiY3QiOiJCbFRoc2xiV2hCdDFwdkJrWUIzT2JpOUgyQ1JJM0VaRnMyU3hJWktvIn0"
    )
    findings = scan_text(payload, file_name="test_crypto.txt")
    assert any(item["algorithm"] == "AES-256-GCM" and float(item["confidence"]) >= 0.95 for item in findings)
    assert any(item["algorithm"] == "PBKDF2" for item in findings)
    assert any(item["algorithm"] == "SHA-256" for item in findings)


def test_rejects_random_base64_not_crypto():
    findings = scan_text("SGVsbG8gV29ybGQ=", file_name="hello.txt")
    assert not any(item["algorithm"] == "AES-256-GCM" for item in findings)


def test_ignores_documentation_false_positive():
    source = '''
# RSA and AES are mentioned here, but no cryptography is performed.
message = "AES is a nice word"
GCM is a mode name only.
'''
    findings = scan_text(source, file_name="notes.py")
    assert not any(item["algorithm"] == "AES-256-GCM" for item in findings)
