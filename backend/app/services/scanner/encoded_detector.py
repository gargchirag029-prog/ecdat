import base64
import json
import re


CRYPTO_METADATA_KEYS = {"alg", "kdf", "hash", "salt", "iv", "nonce", "tag", "ct", "ciphertext", "key", "enc", "iter", "iteration"}


def looks_like_base64(value: str) -> bool:
    candidate = value.strip()
    if not candidate or len(candidate) < 12:
        return False
    if candidate.startswith(".") or candidate.endswith("."):
        return False
    if re.fullmatch(r"[A-Za-z0-9_-]+=*", candidate) is None:
        return False
    if candidate.lower() in {"null", "none", "true", "false"}:
        return False
    return True


def safe_decode_base64(value: str) -> str | None:
    candidate = value.strip()
    if not looks_like_base64(candidate):
        return None
    padded = candidate + "=" * ((4 - len(candidate) % 4) % 4)
    try:
        raw = base64.b64decode(padded, validate=False)
    except Exception:
        return None
    if not raw:
        return None
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return None


def decode_crypto_metadata_candidates(text: str, file_name: str, line_number: int = 1):
    findings = []
    tokens = [token for token in re.findall(r"[A-Za-z0-9_-]{12,}", text) if looks_like_base64(token)]
    for token in tokens:
        decoded = safe_decode_base64(token)
        if not decoded:
            continue
        if not decoded.startswith("{"):
            continue
        try:
            metadata = json.loads(decoded)
        except json.JSONDecodeError:
            continue
        if not isinstance(metadata, dict):
            continue
        if not CRYPTO_METADATA_KEYS.intersection(metadata.keys()):
            continue
        alg = metadata.get("alg")
        kdf = metadata.get("kdf")
        hash_name = metadata.get("hash")
        if alg or kdf or hash_name:
            normalized_found = []
            if alg:
                normalized_found.append(("AES-256-GCM", "A256GCM", str(alg).upper() == "A256GCM"))
                if str(alg).upper() in {"A256GCM", "AES256GCM", "AES-256-GCM"}:
                    findings.append({
                        "algorithm": "AES-256-GCM",
                        "canonical_algorithm": "AES-256-GCM",
                        "category": "symmetric_encryption",
                        "library": "decoded_metadata",
                        "api": None,
                        "file": file_name,
                        "line": line_number,
                        "detection_method": "decoded_metadata",
                        "confidence": 0.99,
                        "evidence": f'"alg":"{alg}"',
                    })
            if kdf:
                if str(kdf).upper() == "PBKDF2":
                    findings.append({
                        "algorithm": "PBKDF2",
                        "canonical_algorithm": "PBKDF2",
                        "category": "password_derivation",
                        "library": "decoded_metadata",
                        "api": None,
                        "file": file_name,
                        "line": line_number,
                        "detection_method": "decoded_metadata",
                        "confidence": 0.99,
                        "evidence": f'"kdf":"{kdf}"',
                    })
            if hash_name:
                normalized_hash = str(hash_name).upper().replace("SHA_", "SHA-")
                if normalized_hash in {"SHA-256", "SHA256"}:
                    findings.append({
                        "algorithm": "SHA-256",
                        "canonical_algorithm": "SHA-256",
                        "category": "hashing",
                        "library": "decoded_metadata",
                        "api": None,
                        "file": file_name,
                        "line": line_number,
                        "detection_method": "decoded_metadata",
                        "confidence": 0.99,
                        "evidence": f'"hash":"{hash_name}"',
                    })
    return findings
