from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import inventory, pqc, reports, risks, scan
from app.core.config import ALLOWED_ORIGINS
from app.database.database import Base, engine
from app.models import crypto_artifact, scan as scan_model

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ECDAT Backend", version="0.1.0", description="Enterprise Cryptographic Discovery & Analysis Tool MVP")
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(scan.router)
app.include_router(inventory.router)
app.include_router(risks.router)
app.include_router(pqc.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"service": "ECDAT Backend", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "service": "ECDAT Backend"}
