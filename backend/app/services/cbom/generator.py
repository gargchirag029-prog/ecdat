from datetime import datetime, timezone


def artifact_to_dict(artifact) -> dict:
    return {
        "id": artifact.id, "scan_id": artifact.scan_id, "algorithm": artifact.algorithm,
        "variant": artifact.variant, "key_size": artifact.key_size, "file": artifact.file,
        "line": artifact.line, "library": artifact.library, "api": artifact.api,
        "purpose": artifact.purpose, "confidence": artifact.confidence, "risk": artifact.risk,
        "risk_score": artifact.risk_score, "risk_reason": artifact.risk_reason,
        "quantum_status": artifact.quantum_status, "pqc_migration": artifact.pqc_migration,
        "migration_priority": artifact.migration_priority, "recommendation": artifact.recommendation,
        "snippet": artifact.snippet,
    }


def generate_cbom(scan_id: str, artifacts) -> dict:
    return {"cbom_version": "0.1", "scan_id": scan_id, "generated_at": datetime.now(timezone.utc).isoformat(), "artifacts": [artifact_to_dict(item) for item in artifacts]}
