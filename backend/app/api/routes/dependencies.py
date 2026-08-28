from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.crypto_artifact import CryptoArtifact
from app.models.scan import Scan

router = APIRouter(prefix="/api", tags=["dependencies"])


@router.get("/dependencies/{scan_id}")
def dependencies(scan_id: str, db: Session = Depends(get_db)):
    scan = db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    artifacts = list(db.scalars(select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id)))
    grouped = defaultdict(list)
    for item in artifacts:
        grouped[item.library or "unknown"].append({"algorithm": item.algorithm, "file": item.file, "purpose": item.purpose})
    return {
        "scan_id": scan_id,
        "dependencies": [
            {"library": lib, "algorithms": entries, "risk_level": max((item.risk for item in artifacts if (item.library or "unknown") == lib), default="LOW", key=lambda value: {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}.get(value, 0))}
            for lib, entries in grouped.items()
        ],
    }
