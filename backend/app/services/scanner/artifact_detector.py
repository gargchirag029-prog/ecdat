import re

PEM_PATTERNS = {
    "PEM_PRIVATE_KEY": re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----", re.IGNORECASE),
    "PEM_PUBLIC_KEY": re.compile(r"-----BEGIN PUBLIC KEY-----", re.IGNORECASE),
    "PEM_CERTIFICATE": re.compile(r"-----BEGIN (?:X509 |)CERTIFICATE-----", re.IGNORECASE),
}


def detect_artifacts(text: str) -> list[dict]:
    findings = []
    for artifact_type, pattern in PEM_PATTERNS.items():
        if pattern.search(text):
            algorithm = "RSA" if "RSA" in text.upper() else "EC" if "EC" in text.upper() else "CERTIFICATE" if "CERTIFICATE" in text.upper() else "UNKNOWN"
            findings.append({
                "algorithm": algorithm,
                "artifact_type": artifact_type,
                "category": "certificate" if artifact_type == "PEM_CERTIFICATE" else "key_material",
                "library": "PEM",
                "api": None,
                "file": "",
                "line": 1,
                "detection_method": "artifact_detect",
                "confidence": 0.99,
                "evidence": artifact_type,
            })
    return findings
