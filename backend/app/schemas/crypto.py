from pydantic import BaseModel


class ArtifactResponse(BaseModel):
    id: int
    scan_id: str
    algorithm: str
    variant: str | None
    key_size: int | None
    file: str
    line: int
    library: str | None
    api: str | None
    purpose: str
    confidence: str
    risk: str
    risk_score: int
    risk_reason: str
    quantum_status: str
    pqc_migration: bool
    migration_priority: str
    recommendation: str
    snippet: str

    model_config = {"from_attributes": True}
