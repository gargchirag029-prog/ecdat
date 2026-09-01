def analyze_pqc(algorithm: str, variant: str | None, key_size: int | None) -> dict:
    normalized = str(algorithm or "").upper()
    variant_value = str(variant or "").upper()

    if normalized in {"AES-GCM", "AES_256_GCM", "AES256GCM", "A256GCM"}:
        normalized = "AES-GCM"
    elif normalized in {"AES-256-CBC", "AES_256_CBC", "AES256CBC", "A256CBC"}:
        normalized = "AES-256-CBC"
    elif normalized in {"3DES", "TDES", "TRIPLE-DES", "TRIPLE_DES"}:
        normalized = "3DES"
    elif normalized.startswith("AES-"):
        normalized = "AES"
    elif normalized.startswith("SHA-"):
        normalized = "SHA"
    elif normalized.startswith("RSA-"):
        normalized = "RSA"

    if normalized in {"RSA", "ECDSA", "ECDH", "ECC"}:
        return {"quantum_status": "VULNERABLE", "pqc_migration": True, "priority": "HIGH", "recommendation": "Evaluate an appropriate post-quantum mechanism based on the application's use case, protocols, libraries, interoperability, and deployment constraints. Educational candidates include ML-DSA for signatures and ML-KEM for key establishment."}
    if normalized == "3DES":
        return {"quantum_status": "NOT_RECOMMENDED", "pqc_migration": True, "priority": "HIGH", "recommendation": "3DES is deprecated. Migrate immediately to AES-GCM or another modern authenticated encryption method."}
    if normalized == "AES-GCM":
        return {"quantum_status": "LOWER_CONCERN", "pqc_migration": False, "priority": "LOW", "recommendation": "AES-GCM is a preferred modern authenticated encryption mode. It is not a post-quantum cryptographic algorithm; continue classical security review and key management hygiene."}
    if normalized == "AES-256-CBC":
        return {"quantum_status": "CONSIDER_MIGRATION", "pqc_migration": False, "priority": "MEDIUM", "recommendation": "AES-256-CBC is a legacy mode. Prefer AES-GCM or an authenticated mode and evaluate migration requirements in context."}
    if normalized == "SHA" and (variant_value == "SHA-1" or variant_value == "SHA1"):
        return {"quantum_status": "LEGACY", "pqc_migration": False, "priority": "HIGH", "recommendation": "Replace SHA-1 with a modern hash after reviewing compatibility and integrity requirements."}
    if normalized == "AES" and key_size == 256:
        return {"quantum_status": "LOWER_CONCERN", "pqc_migration": False, "priority": "LOW", "recommendation": "Continue monitoring and confirm correct key management and mode usage."}
    if normalized == "SHA" and (variant_value == "SHA-256" or variant_value == "SHA256"):
        return {"quantum_status": "LOWER_CONCERN", "pqc_migration": False, "priority": "LOW", "recommendation": "Continue monitoring hash usage and ensure it is not used as a password hash."}
    if normalized == "PBKDF2":
        return {"quantum_status": "NOT_DIRECTLY_QUANTUM_VULNERABLE", "pqc_migration": False, "priority": "LOW", "recommendation": "Keep password-derivation settings under review and confirm they match policy objectives."}
    return {"quantum_status": "REVIEW", "pqc_migration": False, "priority": "MEDIUM", "recommendation": "Review this cryptographic use in its protocol and asset context."}
