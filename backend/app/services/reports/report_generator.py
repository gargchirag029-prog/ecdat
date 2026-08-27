from app.services.cbom.generator import generate_cbom


def generate_assessment(scan_id: str, artifacts) -> dict:
    cbom = generate_cbom(scan_id, artifacts)
    return {"assessment_version": "0.1", "scan_id": scan_id, "cbom": cbom, "artifacts": cbom["artifacts"]}
