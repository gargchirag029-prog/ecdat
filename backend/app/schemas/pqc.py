from pydantic import BaseModel


class PqcResponse(BaseModel):
    readiness_score: int
    quantum_vulnerable: int
    migration_candidates: int
    top_priorities: list[dict]
    algorithm_breakdown: dict[str, int]
