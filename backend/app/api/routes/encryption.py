from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.services.analysis.encryption_catalog import ENCRYPTION_METADATA, normalize_encryption_algorithm

router = APIRouter(prefix="/api/encryption", tags=["encryption"])


@router.post("/analyze")
def analyze_encryption(payload: dict):
    algorithm = payload.get("algorithm") if isinstance(payload, dict) else None
    normalized = normalize_encryption_algorithm(algorithm)
    if normalized is None or normalized not in ENCRYPTION_METADATA:
        return JSONResponse(status_code=400, content={"error": "Unsupported encryption algorithm"})
    result = ENCRYPTION_METADATA[normalized].copy()
    result["algorithm"] = normalized
    return result
