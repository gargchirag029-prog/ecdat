from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.crypto_artifact import CryptoArtifact
from app.models.scan import Scan

router = APIRouter(prefix="/api", tags=["migration"])


@router.get("/migration/{scan_id}/plan")
def migration_plan(scan_id: str, db: Session = Depends(get_db)):
    scan = db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    items = list(db.scalars(select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id)))
    candidates = [item for item in items if item.pqc_migration]
    readiness = round((1 - len(candidates) / len(items)) * 100) if items else 100
    return {
        "scan_id": scan_id,
        "overall_readiness": readiness,
        "critical_migration_candidates": [
            {"algorithm": item.algorithm, "file": item.file, "risk": item.risk, "recommendation": item.recommendation}
            for item in sorted(candidates, key=lambda item: item.risk_score, reverse=True)[:10]
        ],
        "recommended_pqc_target": "ML-KEM for key establishment and ML-DSA/SLH-DSA for signatures depending on the application profile.",
        "affected_components": sorted({item.file for item in candidates}),
        "dependencies": sorted({item.library or "unknown" for item in candidates}),
        "certificates": [],
        "migration_complexity": "MEDIUM" if candidates else "LOW",
        "migration_phases": [
            "Discover",
            "Inventory",
            "Prioritize",
            "Test",
            "Introduce hybrid mechanisms where appropriate",
            "Validate",
            "Deploy",
            "Monitor",
            "Deprecate vulnerable classical mechanisms",
        ],
        "recommended_order": ["Inventory", "Prioritize", "Test", "Deploy"]
    }
