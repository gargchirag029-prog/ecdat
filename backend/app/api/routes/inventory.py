from fastapi import APIRouter, Depends, Query
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
        from fastapi import HTTPException
        raise HTTPException(404, detail={"code": "artifact_not_found", "message": "Artifact not found"})
    return artifact


@router.get("/{scan_id}")
def inventory(scan_id: str, search: str | None = None, algorithm: str | None = None, risk: str | None = None, purpose: str | None = None, page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    from fastapi import HTTPException
    if not db.get(Scan, scan_id):
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    query = select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id).order_by(CryptoArtifact.risk_score.desc(), CryptoArtifact.id)
    items = list(db.scalars(query))
    filters = {"algorithm": algorithm, "risk": risk, "purpose": purpose}
    items = [item for item in items if all(not value or getattr(item, key).lower() == value.lower() for key, value in filters.items()) and (not search or search.lower() in f"{item.algorithm} {item.file} {item.api or ''}".lower())]
    total = len(items)
    start = (page - 1) * limit
    return {"scan_id": scan_id, "page": page, "limit": limit, "total": total, "items": [artifact_to_dict(item) for item in items[start:start + limit]]}


@router.get("/artifact/{artifact_id}", response_model=ArtifactResponse)
def artifact_detail(artifact_id: int, db: Session = Depends(get_db)):
    return artifact_or_404(artifact_id, db)
