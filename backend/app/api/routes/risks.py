from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.crypto_artifact import CryptoArtifact
from app.models.scan import Scan
from app.services.cbom.generator import artifact_to_dict

router = APIRouter(prefix="/api/risks", tags=["risks"])


@router.get("/{scan_id}")
def risks(scan_id: str, db: Session = Depends(get_db)):
    if not db.get(Scan, scan_id):
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    items = list(db.scalars(select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id).order_by(CryptoArtifact.risk_score.desc())))
    counts = {level.lower(): sum(item.risk == level for item in items) for level in ("CRITICAL", "HIGH", "MEDIUM", "LOW")}
    return {**counts, "risk_score": round(sum(item.risk_score for item in items) / len(items)) if items else 0, "top_findings": [artifact_to_dict(item) for item in items[:10]]}
