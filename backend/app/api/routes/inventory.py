from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.crypto_artifact import CryptoArtifact
from app.models.scan import Scan
from app.schemas.crypto import ArtifactResponse
from app.services.cbom.generator import artifact_to_dict

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


def artifact_or_404(artifact_id: int, db: Session) -> CryptoArtifact:
    artifact = db.get(CryptoArtifact, artifact_id)
    if not artifact:
        raise HTTPException(404, detail={"code": "artifact_not_found", "message": "Artifact not found"})
    return artifact


@router.get("/{scan_id}")
def inventory(scan_id: str, search: str | None = None, algorithm: str | None = None, risk: str | None = None, risk_level: str | None = None, purpose: str | None = None, quantum_vulnerable: bool | None = None, language: str | None = None, component: str | None = None, page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    if not db.get(Scan, scan_id):
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    query = select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id).order_by(CryptoArtifact.risk_score.desc(), CryptoArtifact.id)
    items = list(db.scalars(query))
    effective_risk = (risk or risk_level or "").upper()
    filters = {"algorithm": algorithm, "risk": effective_risk, "purpose": purpose}
    filtered = []
    for item in items:
        match = True
        for key, value in filters.items():
            if value and getattr(item, key, None) is not None and str(getattr(item, key)).upper() != value.upper():
                match = False
                break
        if quantum_vulnerable is not None and bool(item.pqc_migration) != bool(quantum_vulnerable):
            match = False
        if language and language.lower() not in (item.file.lower() or ""):
            match = False
        if component and component.lower() not in (item.file.lower() or "") and component.lower() not in (item.purpose.lower() or ""):
            match = False
        if search and search.lower() not in f"{item.algorithm} {item.file} {item.api or ''} {item.purpose or ''}".lower():
            match = False
        if match:
            filtered.append(item)
    total = len(filtered)
    start = (page - 1) * limit
    return {"scan_id": scan_id, "page": page, "limit": limit, "total": total, "items": [artifact_to_dict(item) for item in filtered[start:start + limit]]}


@router.get("/artifact/{artifact_id}", response_model=ArtifactResponse)
def artifact_detail(artifact_id: int, db: Session = Depends(get_db)):
    return artifact_or_404(artifact_id, db)
