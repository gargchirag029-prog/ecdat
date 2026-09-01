ENCRYPTION_METADATA = {
    "AES-GCM": {
        "algorithm": "AES-GCM",
        "type": "symmetric",
        "category": "symmetric encryption",
        "status": "recommended",
        "security_level": "strong",
        "risk_score": 10,
        "pqc_status": "not directly affected",
        "recommendation": "Preferred modern authenticated encryption method",
        "legacy": False,
        "mode": "GCM",
        "key_size": 256,
    },
    "AES-256-CBC": {
        "algorithm": "AES-256-CBC",
        "type": "symmetric",
        "category": "symmetric encryption",
        "status": "legacy",
        "security_level": "strong with proper implementation",
        "risk_score": 35,
        "pqc_status": "quantum impact should be considered",
        "recommendation": "Use AES-GCM for new implementations",
        "legacy": True,
        "mode": "CBC",
        "key_size": 256,
    },
    "3DES": {
        "algorithm": "3DES",
        "type": "symmetric",
        "category": "symmetric encryption",
        "status": "legacy/deprecated",
        "security_level": "weak/obsolete",
        "risk_score": 90,
        "pqc_status": "not recommended for future systems",
        "recommendation": "Migrate to AES-GCM",
        "legacy": True,
        "mode": "3DES",
        "key_size": 112,
    },
}

ENCRYPTION_ALIASES = {
    "AES-GCM": "AES-GCM",
    "AES_GCM": "AES-GCM",
    "AESGCM": "AES-GCM",
    "AES-256-GCM": "AES-GCM",
    "AES_256_GCM": "AES-GCM",
    "AES256GCM": "AES-GCM",
    "A256GCM": "AES-GCM",
    "AES-256-CBC": "AES-256-CBC",
    "AES_256_CBC": "AES-256-CBC",
    "AES256CBC": "AES-256-CBC",
    "A256CBC": "AES-256-CBC",
    "3DES": "3DES",
    "TDES": "3DES",
    "TRIPLE-DES": "3DES",
    "TRIPLE_DES": "3DES",
}


def normalize_encryption_algorithm(value: str | None) -> str | None:
    if value is None:
        return None
    key = str(value).strip()
    if not key:
        return None
    upper = key.upper()
    if upper in ENCRYPTION_ALIASES:
        return ENCRYPTION_ALIASES[upper]
    normalized = upper.replace("-", "_").replace(" ", "_")
    return ENCRYPTION_ALIASES.get(normalized)


def get_encryption_metadata(value: str | None) -> dict | None:
    normalized = normalize_encryption_algorithm(value)
    if normalized is None:
        return None
    return ENCRYPTION_METADATA.get(normalized)
