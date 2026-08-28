# ECDAT Architecture Review

## Current architecture

The repository currently contains a compact FastAPI backend with a minimal MVC-like structure:

- `backend/app/main.py` boots the FastAPI app and wires the router modules.
- `backend/app/api/routes` exposes upload, scan, inventory, risk, PQC, and report endpoints.
- `backend/app/models` stores SQLAlchemy models for Scan and CryptoArtifact.
- `backend/app/services/scanner` performs deterministic regex-driven detection over supported source and config files.
- `backend/app/services/analysis` calculates risk and PQC migration guidance.
- `backend/app/services/cbom` serializes a basic CBOM payload.
- `backend/app/utils/file_utils.py` sanitizes uploads and protects ZIP extraction from path traversal and size abuse.

## Strengths

- Clear modular separation between API, DB, and services.
- Deterministic scoring and detection rules are easy to explain and test.
- SQLite persistence is adequate for a lightweight MVP and keeps the project easy to run locally.
- The upload pipeline already includes path traversal prevention and archive size checks.
- The API contracts are simple and suitable for frontend integration.

## Weaknesses

- The scanner is effectively regex-first and file-line based, so it does not yet model operations, dependency trees, certificate metadata, or language-specific AST analysis.
- There is no explicit dependency, certificate, graph, migration, or dashboard domain model yet.
- Risk and PQC logic is concise but not yet structured around multi-factor asset context.
- API compatibility is split between older routes like `/api/scan/...` and the newer, cleaner `/api/...` conventions expected by product workflows.
- Security controls are in place for ZIP extraction, but a full hardened project policy and env-based configuration file are still missing.

## Technical debt

- Database schema is not yet aligned with a stronger inventory model for assets, dependencies, graph edges, and migration recommendations.
- There are no explicit background job or queue primitives for long-running scans.
- The CBOM/report payloads are lightweight but not yet versioned with richer fields or metadata.
- The readme and environment configuration are minimal and do not yet capture the production roadmap.

## Proposed changes

1. Keep the existing working scan flow and endpoint contracts, but add compatibility aliases and the missing modern route namespace.
2. Add a stronger security and configuration baseline with `.env.example` and a hardened `.gitignore`.
3. Upgrade the score outputs to include transparent factors and richer PQC readiness explanation.
4. Add dashboard, dependency, graph, and migration endpoint wrappers that aggregate existing artifact data into product-friendly payloads.
5. Preserve a deterministic core while allowing future AI explanation services to sit above it.

## Migration plan

- Stage 1: Architecture review and baseline protection.
- Stage 2: Clean repo and config.
- Stage 3: Improve discovery and scoring.
- Stage 4: Expand inventory, dependency, and certificate metadata.
- Stage 5: Add migration, graph, and dashboard APIs.
- Stage 6: Extend tests, reporting, and documentation.

## Conclusion

The repository has a solid MVP foundation. The best next move is not a full rewrite, but a disciplined modular enhancement around the current scan, model, and risk contracts so that the backend can evolve into an enterprise-grade cryptographic intelligence platform without breaking the existing frontend or tests.
