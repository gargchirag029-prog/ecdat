import json
import re
from pathlib import Path

from app.services.scanner.api_signatures import API_SIGNATURES
from app.services.scanner.artifact_detector import detect_artifacts
from app.services.scanner.encoded_detector import decode_crypto_metadata_candidates
from app.services.scanner.normalizer import CRYPTO_KEY_FIELDS, decode_crypto_metadata, normalize_metadata_finding


def _lookup_api_signature(line: str):
    for signature, meta in API_SIGNATURES.items():
        if signature in line:
            return meta
    return None


def _aes_256_gcm_alias_pattern(line: str):
    normalized = line.strip()
    upper = normalized.upper()
    if re.search(r"(?:AES[-_]?256[-_]?GCM|AES256GCM|A256GCM|AES[-_]?256\s*GCM|AES[-_]?256\s*GCM)", upper):
        return "AES-256-GCM"
    if "AES/GCM/NO padding" in upper.replace(" ", ""):
        return "AES-256-GCM"
    if re.search(r"AES/GCM/NOPADDING|AES/GCM/NoPadding", line, re.IGNORECASE):
        return "AES-256-GCM"
    return None


def _infer_algorithm_from_literal(line: str):
    line_upper = line.upper()
    if "PBKDF2" in line_upper or "PBKDF2HMAC" in line_upper:
        return "PBKDF2"
    if "SHA256" in line_upper or "SHA-256" in line_upper:
        return "SHA-256"
    if _aes_256_gcm_alias_pattern(line):
        return "AES-256-GCM"
    if "AES.CBC" in line_upper or "A256CBC" in line_upper or "AES-256-CBC" in line_upper:
        return "AES-256-CBC"
    if "RSA" in line_upper:
        return "RSA"
    if "ECDSA" in line_upper:
        return "ECDSA"
    if "ECDH" in line_upper:
        return "ECDH"
    if "AES" in line_upper:
        return "AES"
    if "SHA" in line_upper:
        return "SHA"
    return None


def _decode_text_candidates(text: str, file_name: str):
    findings = []
    for token in re.findall(r"[A-Za-z0-9_-]{12,}", text):
        metadata = decode_crypto_metadata(token)
        if metadata:
            formatted = normalize_metadata_finding(metadata, file_name)
            findings.extend(formatted)
    findings.extend(decode_crypto_metadata_candidates(text, file_name))
    return findings


def _scan_literals(text: str, file_name: str):
    findings = []
    for line_no, line in enumerate(text.splitlines(), start=1):
        literal = _infer_algorithm_from_literal(line)
        if not literal:
            continue
        lowered = line.lower()
        if any(phrase in lowered for phrase in ("does not use", "doesn't use", "not use", "no use of", "planned later", "implementation planned")):
            continue
        if line.lstrip().startswith("#"):
            continue
        findings.append({
            "algorithm": literal,
            "canonical_algorithm": literal,
            "category": "literal_reference",
            "library": "literal",
            "api": None,
            "file": file_name,
            "line": line_no,
            "detection_method": "literal_match",
            "confidence": 0.25,
            "evidence": line.strip()[:300],
        })
    return findings


def _scan_api_calls(text: str, file_name: str):
    findings = []
    for line_no, line in enumerate(text.splitlines(), start=1):
        api_meta = _lookup_api_signature(line)
        if line and ("createCipheriv" in line or 'Cipher.getInstance("AES/GCM/NoPadding")' in line or "AES/GCM/NoPadding" in line or "modes.GCM" in line or "AES.MODE_GCM" in line or "aes-256-gcm" in line.lower() or "A256GCM" in line.upper()):
            if "AES/GCM" in line or "aes-256-gcm" in line.lower() or "A256GCM" in line.upper() or "AES.MODE_GCM" in line or "modes.GCM" in line:
                findings.append({
                    "algorithm": "AES-256-GCM",
                    "canonical_algorithm": "AES-256-GCM",
                    "category": "symmetric_encryption",
                    "library": "crypto",
                    "api": "createCipheriv" if "createCipheriv" in line else "Cipher.getInstance" if "Cipher.getInstance" in line else "AES/GCM",
                    "file": file_name,
                    "line": line_no,
                    "detection_method": "api_signature",
                    "confidence": 0.99,
                    "evidence": line.strip()[:300],
                    "usage": "Encryption",
                })
            if api_meta:
                findings.append({
                    "algorithm": api_meta["algorithm"],
                    "canonical_algorithm": api_meta["algorithm"],
                    "category": api_meta["category"],
                    "library": api_meta["library"],
                    "api": api_meta["api"],
                    "file": file_name,
                    "line": line_no,
                    "detection_method": api_meta["detection_method"],
                    "confidence": float(api_meta["confidence"]),
                    "evidence": line.strip()[:300],
                    "usage": api_meta["usage"],
                })
            continue
        if not api_meta:
            continue
        findings.append({
            "algorithm": api_meta["algorithm"],
            "canonical_algorithm": api_meta["algorithm"],
            "category": api_meta["category"],
            "library": api_meta["library"],
            "api": api_meta["api"],
            "file": file_name,
            "line": line_no,
            "detection_method": api_meta["detection_method"],
            "confidence": float(api_meta["confidence"]),
            "evidence": line.strip()[:300],
            "usage": api_meta["usage"],
        })
    return findings


def _scan_artifacts(text: str, file_name: str):
    findings = []
    for artifact in detect_artifacts(text):
        artifact["file"] = file_name
        findings.append(artifact)
    return findings


def scan_text(text: str, file_name: str = "unknown.txt") -> list[dict]:
    findings = []
    findings.extend(_scan_api_calls(text, file_name))
    findings.extend(_scan_literals(text, file_name))
    findings.extend(_decode_text_candidates(text, file_name))
    findings.extend(_scan_artifacts(text, file_name))
    deduped = {}
    for item in findings:
        key = (item.get("algorithm"), item.get("file"), item.get("line"), item.get("detection_method"), item.get("api"), item.get("artifact_type"))
        if key not in deduped or item.get("confidence", 0) > deduped[key].get("confidence", 0):
            deduped[key] = item
    return sorted(deduped.values(), key=lambda x: (-float(x.get("confidence", 0)), x.get("file", ""), x.get("line", 0)))


def scan_file(path: str | Path):
    file_path = Path(path)
    text = file_path.read_text(encoding="utf-8", errors="replace")
    return scan_text(text, file_name=file_path.name)
