# ECDAT Backend

ECDAT (Enterprise Cryptographic Discovery & Analysis Tool) is a FastAPI MVP that treats uploaded projects as untrusted data, discovers cryptographic usage, stores a normalized inventory, and produces deterministic risk and post-quantum migration analysis.

## Architecture

The backend follows a layered design: upload and scanner input are treated as untrusted content, then normalized into cryptographic artifacts, risk scores, PQC guidance, dependency summaries, CBOM exports, and migration planning. The current architecture is intentionally compact but modular, so it can evolve toward richer dependency and certificate models without rewriting the core API.

- `app/services/scanner`: centralized regex rules, parsing heuristics, and bounded recursive scanning
- `app/services/analysis`: transparent risk scoring and PQC recommendations
- `app/services/cbom`: CBOM serialization
- `app/models` and `app/database`: SQLAlchemy persistence
- `app/api/routes`: upload, scan, inventory, risks, PQC, and report endpoints

## Setup

From `backend/` on Windows:

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`; Swagger is at `/docs` and ReDoc is at `/redoc`.

## Scan flow

```powershell
curl.exe -F "file=@my-project.zip" http://localhost:8000/api/scan/upload
curl.exe -X POST http://localhost:8000/api/scan/scan_<id>/start
curl.exe http://localhost:8000/api/scan/scan_<id>
curl.exe "http://localhost:8000/api/inventory/scan_<id>?algorithm=RSA&page=1&limit=50"
curl.exe http://localhost:8000/api/risks/scan_<id>
curl.exe http://localhost:8000/api/pqc/scan_<id>
curl.exe http://localhost:8000/api/reports/scan_<id>/cbom
```

The API also exposes compatible aliases such as `/api/scans`, `/api/scans/{scan_id}/start`, `/api/dashboard/{scan_id}`, `/api/dependencies/{scan_id}`, `/api/graph/{scan_id}`, and `/api/migration/{scan_id}/plan`.

## Deterministic scoring

Baseline scores are transparent: public-key RSA/ECDSA/ECDH/ECC starts at 85 (HIGH), SHA-1 at 90 (CRITICAL), AES-128 at 50 (MEDIUM), AES-256 and SHA-256 at 15 (LOW). LOW confidence subtracts 15 and MEDIUM confidence subtracts 5. Known RSA-1024 receives an additional 10 points. PQC readiness is `100 - (quantum-vulnerable artifacts / total artifacts * 100)` and migration candidates are public-key findings requiring planning.

## Tests

```powershell
pytest -q
```

The sample project contains harmless API references only; it includes no real private keys, credentials, or executed uploaded code. ZIP extraction rejects absolute paths, parent traversal, oversized archives, and invalid archives. Unsupported extensions, ignored directories, binary-like files, and files over the configured per-file limit are skipped.

## Configuration

`ECDAT_DATABASE_URL`, `ECDAT_UPLOAD_DIR`, `ECDAT_ALLOWED_ORIGINS`, `ECDAT_MAX_UPLOAD_BYTES`, `ECDAT_MAX_FILE_BYTES`, and `ECDAT_MAX_EXTRACTED_BYTES` are optional environment variables. A template is provided in `.env.example`.

## Future work

Background scan jobs, richer AST-aware language parsers, asset criticality, authenticated multi-user access, and an AI explanation service can be added around the existing structured CBOM/risk/PQC contracts without changing scanner responsibilities.
