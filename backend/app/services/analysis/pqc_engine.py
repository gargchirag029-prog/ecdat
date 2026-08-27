def analyze_pqc(algorithm: str, variant: str | None, key_size: int | None) -> dict:
    normalized = algorithm.upper()
    if normalized in {"RSA", "ECDSA", "ECDH", "ECC"}:
        return {"quantum_status": "VULNERABLE", "pqc_migration": True, "priority": "HIGH", "recommendation": "Evaluate an appropriate post-quantum mechanism based on the application's use case, protocols, libraries, interoperability, and deployment constraints. Educational candidates include ML-DSA for signatures and ML-KEM for key establishment."}
    if normalized == "SHA" and variant and "1" in variant:
        return {"quantum_status": "LEGACY", "pqc_migration": False, "priority": "HIGH", "recommendation": "Replace SHA-1 with a modern hash after reviewing compatibility and integrity requirements."}
    if normalized == "AES" and key_size == 256:
        return {"quantum_status": "LOWER_CONCERN", "pqc_migration": False, "priority": "LOW", "recommendation": "Continue monitoring and confirm correct key management and mode usage."}
    if normalized == "SHA" and variant and "256" in variant:
        return {"quantum_status": "LOWER_CONCERN", "pqc_migration": False, "priority": "LOW", "recommendation": "Continue monitoring hash usage and ensure it is not used as a password hash."}
    return {"quantum_status": "REVIEW", "pqc_migration": False, "priority": "MEDIUM", "recommendation": "Review this cryptographic use in its protocol and asset context."}
