from collections import Counter
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.crypto_artifact import CryptoArtifact
from app.models.scan import Scan
from app.services.cbom.generator import artifact_to_dict

router = APIRouter(prefix="/api/pqc", tags=["pqc"])


@router.get("/{scan_id}")
def pqc(scan_id: str, db: Session = Depends(get_db)):
    if not db.get(Scan, scan_id):
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    items = list(db.scalars(select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id)))
    candidates = [item for item in items if item.pqc_migration]
    vulnerable = sum(item.quantum_status == "VULNERABLE" for item in items)
    readiness = round((1 - vulnerable / len(items)) * 100) if items else 100
    return {"readiness_score": readiness, "level": "NEEDS_ATTENTION" if readiness < 60 else "MONITOR" if readiness < 80 else "READY", "quantum_vulnerable": vulnerable, "migration_candidates": len(candidates), "top_priorities": [artifact_to_dict(item) for item in sorted(candidates, key=lambda item: item.risk_score, reverse=True)[:10]], "algorithm_breakdown": dict(Counter(item.algorithm for item in candidates))}
