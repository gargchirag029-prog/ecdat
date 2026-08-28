from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.crypto_artifact import CryptoArtifact
from app.models.scan import Scan

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard/{scan_id}")
def dashboard(scan_id: str, db: Session = Depends(get_db)):
    scan = db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    items = list(db.scalars(select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id)))
    totals = {"total_assets": len(items), "quantum_vulnerable": sum(1 for item in items if item.pqc_migration), "critical": sum(1 for item in items if item.risk == "CRITICAL"), "high": sum(1 for item in items if item.risk == "HIGH"), "medium": sum(1 for item in items if item.risk == "MEDIUM"), "low": sum(1 for item in items if item.risk == "LOW")}
    readiness = round((1 - totals["quantum_vulnerable"] / len(items)) * 100) if items else 100
    return {
        **totals,
        "pqc_readiness": readiness,
        "top_algorithms": [],
        "top_risks": [],
        "migration_summary": {"candidates": totals["quantum_vulnerable"], "readiness": readiness},
    }
