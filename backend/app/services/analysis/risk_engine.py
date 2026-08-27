def calculate_risk(artifact) -> dict:
    algorithm = artifact.algorithm.upper()
    score = 20
    reason = "Review cryptographic usage in its protocol and asset context."
    if algorithm in {"RSA", "ECDSA", "ECDH", "ECC"}:
        score, reason = 85, "Public-key cryptographic mechanism requiring post-quantum migration planning."
    elif algorithm == "SHA" and artifact.variant and "1" in artifact.variant:
        score, reason = 90, "SHA-1 is a legacy hash with high collision risk."
    elif algorithm == "AES":
        if artifact.key_size == 128:
            score, reason = 50, "AES-128 has a reduced security margin under quantum search and should be inventoried for migration planning."
        elif artifact.key_size == 256:
            score, reason = 15, "AES-256 has a lower quantum concern when used with sound key management."
    elif algorithm == "SHA" and artifact.variant and "256" in artifact.variant:
        score, reason = 15, "SHA-256 has a lower quantum concern for integrity and hashing use."
    if artifact.confidence == "LOW":
        score = max(0, score - 15)
    elif artifact.confidence == "MEDIUM":
        score = max(0, score - 5)
    if artifact.key_size in {1024, 2048} and algorithm == "RSA":
        score += 10 if artifact.key_size == 1024 else 0
    level = "CRITICAL" if score >= 90 else "HIGH" if score >= 70 else "MEDIUM" if score >= 40 else "LOW"
    return {"score": min(score, 100), "level": level, "reason": reason}
