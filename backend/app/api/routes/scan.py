from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import UPLOAD_DIR
from app.database.database import get_db
from app.models.crypto_artifact import CryptoArtifact
from app.models.scan import Scan
from app.schemas.scan import ScanSummary, StartResponse, UploadResponse
from app.services.analysis.pqc_engine import analyze_pqc
from app.services.analysis.risk_engine import calculate_risk
from app.services.scanner.scanner import scan_project
from app.utils.file_utils import store_upload

router = APIRouter(prefix="/api/scan", tags=["scan"])


def get_scan_or_404(scan_id: str, db: Session) -> Scan:
    scan = db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(404, detail={"code": "scan_not_found", "message": "Scan not found"})
    return scan


@router.post("/upload", response_model=UploadResponse, status_code=201)
def upload_project(file: UploadFile = File(...), db: Session = Depends(get_db)):
    scan_id = f"scan_{uuid4().hex[:12]}"
    _, _ = store_upload(file, scan_id)
    scan = Scan(id=scan_id, filename=Path(file.filename or "project.zip").name, status="uploaded")
    db.add(scan)
    db.commit()
    return {"scan_id": scan.id, "filename": scan.filename, "status": scan.status}


@router.post("/{scan_id}/start", response_model=StartResponse)
def start_scan(scan_id: str, db: Session = Depends(get_db)):
    scan = get_scan_or_404(scan_id, db)
    if scan.status != "uploaded":
        raise HTTPException(400, detail={"code": "invalid_scan_state", "message": "Only uploaded scans can be started"})
    root = UPLOAD_DIR / scan_id / "project"
    if not root.is_dir():
        raise HTTPException(400, detail={"code": "project_missing", "message": "Extracted project is unavailable"})
    scan.status = "scanning"
    db.commit()
    files_scanned, detected = scan_project(root)
    for item in detected:
        pqc = analyze_pqc(item.algorithm, item.variant, item.key_size)
        draft = type("Draft", (), {"algorithm": item.algorithm, "variant": item.variant, "key_size": item.key_size, "confidence": item.confidence})()
        risk = calculate_risk(draft)
        db.add(CryptoArtifact(scan_id=scan_id, algorithm=item.algorithm, variant=item.variant, key_size=item.key_size, file=item.file, line=item.line, library=item.library, api=item.api, purpose=item.purpose, confidence=item.confidence, risk=risk["level"], risk_score=risk["score"], risk_reason=risk["reason"], quantum_status=pqc["quantum_status"], pqc_migration=pqc["pqc_migration"], migration_priority=pqc["priority"], recommendation=pqc["recommendation"], snippet=item.snippet))
    scan.status = "completed"
    scan.files_scanned = files_scanned
    scan.artifacts_found = len(detected)
    scan.completed_at = datetime.now(timezone.utc)
    db.commit()
    return {"scan_id": scan.id, "status": scan.status, "files_scanned": files_scanned, "artifacts_found": len(detected)}


@router.get("/{scan_id}", response_model=ScanSummary)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    scan = get_scan_or_404(scan_id, db)
    counts = {level: sum(1 for item in scan.artifacts if item.risk == level) for level in ("CRITICAL", "HIGH", "MEDIUM", "LOW")}
    return {**scan.__dict__, "high_risk": counts["HIGH"], "critical": counts["CRITICAL"], "medium": counts["MEDIUM"], "low": counts["LOW"], "pqc_candidates": sum(1 for item in scan.artifacts if item.pqc_migration)}
