from datetime import datetime
from pydantic import BaseModel


class UploadResponse(BaseModel):
    scan_id: str
    filename: str
    status: str


class ScanSummary(BaseModel):
    scan_id: str
    filename: str
    status: str
    created_at: datetime
    completed_at: datetime | None
    files_scanned: int
    artifacts_found: int
    high_risk: int
    critical: int
    medium: int
    low: int
    pqc_candidates: int


class StartResponse(BaseModel):
    scan_id: str
    status: str
    files_scanned: int
    artifacts_found: int
