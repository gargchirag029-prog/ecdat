from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.crypto_artifact import CryptoArtifact
from app.models.scan import Scan
from app.services.cbom.generator import generate_cbom
from app.services.reports.report_generator import generate_assessment

router = APIRouter(prefix="/api/reports", tags=["reports"])


def get_data(scan_id: str, db: Session):
    if not db.get(Scan, scan_id):
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    artifacts = list(db.scalars(select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id)))
    return generate_cbom(scan_id, artifacts)


@router.get("/{scan_id}/cbom")
def cbom(scan_id: str, db: Session = Depends(get_db)):
    return get_data(scan_id, db)


@router.get("/{scan_id}/json")
def report(scan_id: str, db: Session = Depends(get_db)):
    if not db.get(Scan, scan_id):
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    artifacts = list(db.scalars(select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id)))
    return generate_assessment(scan_id, artifacts)
