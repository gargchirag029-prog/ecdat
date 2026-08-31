def _coerce_artifact(artifact):
    if artifact is None:
        return {"algorithm": "UNKNOWN", "variant": None, "key_size": None, "confidence": "MEDIUM"}
    if isinstance(artifact, dict):
        return {
            "algorithm": artifact.get("algorithm", "UNKNOWN"),
            "variant": artifact.get("variant"),
            "key_size": artifact.get("key_size"),
            "confidence": artifact.get("confidence", "MEDIUM"),
        }
    return {
        "algorithm": getattr(artifact, "algorithm", "UNKNOWN"),
        "variant": getattr(artifact, "variant", None),
        "key_size": getattr(artifact, "key_size", None),
        "confidence": getattr(artifact, "confidence", "MEDIUM"),
    }


def calculate_risk(artifact) -> dict:
    item = _coerce_artifact(artifact)
    algorithm = str(item["algorithm"]).upper()
    variant = item["variant"]
    key_size = item["key_size"]
    confidence = str(item.get("confidence", "MEDIUM")).upper()
    if algorithm.startswith("AES-"):
        algorithm = "AES"
        if key_size is None and variant and "256" in variant:
            key_size = 256
        elif key_size is None and variant and "128" in variant:
            key_size = 128
    elif algorithm.startswith("SHA-"):
        algorithm = "SHA"
    elif algorithm.startswith("RSA-"):
        algorithm = "RSA"
    score = 20
    factors = []
    reason = "Review cryptographic usage in its protocol and asset context."
    if algorithm in {"RSA", "ECDSA", "ECDH", "ECC"}:
        score, reason = 85, "Public-key cryptographic mechanism requiring post-quantum migration planning."
        factors.append("Public-key algorithm is quantum-vulnerable")
    elif algorithm == "SHA" and variant == "SHA-1":
        score, reason = 90, "SHA-1 is a legacy hash with high collision risk."
        factors.append("Legacy hash function")
    elif algorithm == "AES":
        if key_size == 128:
            score, reason = 50, "AES-128 has a reduced security margin under quantum search and should be inventoried for migration planning."
            factors.append("AES-128 key size is smaller than the current preferred standard")
        elif key_size == 256:
            score, reason = 15, "AES-256 has a lower quantum concern when used with sound key management."
            factors.append("AES-256 has a lower quantum concern but still needs context review")
    elif algorithm == "SHA" and variant == "SHA-256":
        score, reason = 15, "SHA-256 has a lower quantum concern for integrity and hashing use."
        factors.append("SHA-256 poses lower near-term risk under current assumptions")
    if confidence == "LOW":
        score = max(0, score - 15)
        factors.append("Evidence confidence is low")
    elif confidence == "MEDIUM":
        score = max(0, score - 5)
    if key_size in {1024, 2048} and algorithm == "RSA":
        score += 10 if key_size == 1024 else 0
        factors.append("RSA key size is in a legacy or reduced security range")
    level = "CRITICAL" if score >= 90 else "HIGH" if score >= 70 else "MEDIUM" if score >= 40 else "LOW"
    return {"score": min(score, 100), "level": level, "reason": reason, "factors": factors or [reason]}
