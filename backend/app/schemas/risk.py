from pydantic import BaseModel


class RiskResponse(BaseModel):
    critical: int
    high: int
    medium: int
    low: int
    risk_score: int
    top_findings: list[dict]
