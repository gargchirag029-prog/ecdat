from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.crypto_artifact import CryptoArtifact
from app.models.scan import Scan

router = APIRouter(prefix="/api", tags=["graph"])


@router.get("/graph/{scan_id}")
def graph(scan_id: str, db: Session = Depends(get_db)):
    scan = db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    artifacts = list(db.scalars(select(CryptoArtifact).where(CryptoArtifact.scan_id == scan_id)))
    nodes = [{"id": f"scan:{scan_id}", "label": "Scan", "type": "scan"}]
    edges = []
    for artifact in artifacts:
        node_id = f"artifact:{artifact.id}"
        nodes.append({"id": node_id, "label": artifact.algorithm, "type": "algorithm"})
        edges.append({"source": f"scan:{scan_id}", "target": node_id, "label": "contains"})
        if artifact.library:
            lib_id = f"library:{artifact.library}"
            nodes.append({"id": lib_id, "label": artifact.library, "type": "library"})
            edges.append({"source": node_id, "target": lib_id, "label": "uses"})
    return {"nodes": nodes, "edges": edges}
