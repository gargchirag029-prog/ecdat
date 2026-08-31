import base64
import json
import re


CRYPTO_KEY_FIELDS = {"alg", "kdf", "hash", "salt", "iv", "nonce", "tag", "ct", "ciphertext", "key", "enc", "kid", "iteration", "iter"}


def normalize_algorithm_name(value: str) -> str:
    cleaned = value.strip().upper().replace("-", "").replace("_", "")
    aliases = {
        "A128GCM": "AES-128-GCM",
        "A192GCM": "AES-192-GCM",
        "A256GCM": "AES-256-GCM",
        "A128CBC": "AES-128-CBC",
        "A256CBC": "AES-256-CBC",
        "SHA256": "SHA-256",
        "SHA384": "SHA-384",
        "SHA512": "SHA-512",
        "HS256": "HMAC-SHA256",
        "HS384": "HMAC-SHA384",
        "HS512": "HMAC-SHA512",
        "RS256": "RSA-SHA256",
        "RS384": "RSA-SHA384",
        "RS512": "RSA-SHA512",
        "ES256": "ECDSA-SHA256",
        "ES384": "ECDSA-SHA384",
        "ES512": "ECDSA-SHA512",
        "PBKDF2": "PBKDF2",
    }
    return aliases.get(cleaned, value.strip())


def safe_base64_decode(value: str) -> str | None:
    candidate = value.strip()
    if not candidate:
        return None
    if len(candidate) < 8:
        return None
    if re.fullmatch(r"[A-Za-z0-9_-]+={0,2}", candidate) is None:
        return None
    try:
        padded = candidate + "=" * ((4 - len(candidate) % 4) % 4)
        decoded = base64.b64decode(padded, validate=False)
    except Exception:
        return None
    if not decoded:
        return None
    try:
        text = decoded.decode("utf-8")
    except UnicodeDecodeError:
        return None
    return text


def decode_crypto_metadata(value: str) -> dict:
    result = {}
    candidate = value.strip()
    if not candidate:
        return result
    decoded = safe_base64_decode(candidate)
    if not decoded:
        return result
    maybe_json = decoded.strip()
    if not maybe_json.startswith("{") and not maybe_json.startswith("["):
        return result
    try:
        parsed = json.loads(maybe_json)
    except json.JSONDecodeError:
        return result
    if isinstance(parsed, dict):
        result = parsed
    elif isinstance(parsed, list) and parsed and isinstance(parsed[0], dict):
        result = parsed[0]
    return result


def normalize_metadata_finding(metadata: dict, file_name: str, line_number: int = 1) -> list[dict]:
    findings: list[dict] = []
    if not metadata:
        return findings
    matches = []
    if "alg" in metadata:
        matches.append(("algorithm", metadata["alg"]))
    if "kdf" in metadata:
        matches.append(("algorithm", metadata["kdf"]))
    if "hash" in metadata:
        matches.append(("algorithm", metadata["hash"]))
    if "enc" in metadata and metadata.get("enc"):
        matches.append(("algorithm", f"enc:{metadata['enc']}"))
    for key, value in matches:
        normalized = normalize_algorithm_name(str(value))
        if normalized.startswith("enc:"):
            continue
        if normalized in {"AES-256-GCM", "AES-128-GCM", "AES-256-CBC", "AES-128-CBC"}:
            findings.append({
                "algorithm": normalized.split("-")[0] if False else normalized,
                "canonical_algorithm": normalized,
                "category": "symmetric_encryption",
                "library": "decoded_metadata",
                "api": None,
                "file": file_name,
                "line": line_number,
                "detection_method": "decoded_metadata",
                "confidence": 0.99,
                "evidence": json.dumps(metadata, separators=(",", ":"), ensure_ascii=False)[:600],
            })
        elif normalized in {"PBKDF2", "SHA-256", "HMAC-SHA256"}:
            findings.append({
                "algorithm": normalized,
                "canonical_algorithm": normalized,
                "category": "password_derivation" if normalized == "PBKDF2" else "hashing" if normalized.startswith("SHA") else "authentication",
                "library": "decoded_metadata",
                "api": None,
                "file": file_name,
                "line": line_number,
                "detection_method": "decoded_metadata",
                "confidence": 0.99,
                "evidence": json.dumps(metadata, separators=(",", ":"), ensure_ascii=False)[:600],
            })
    if "salt" in metadata or "iv" in metadata or "nonce" in metadata or "tag" in metadata or "ct" in metadata or "ciphertext" in metadata:
        if not findings:
            findings.append({
                "algorithm": "Unknown",
                "canonical_algorithm": "Unknown",
                "category": "encrypted_payload",
                "library": "decoded_metadata",
                "api": None,
                "file": file_name,
                "line": line_number,
                "detection_method": "decoded_metadata",
                "confidence": 0.72,
                "evidence": json.dumps(metadata, separators=(",", ":"), ensure_ascii=False)[:600],
            })
    return findings
