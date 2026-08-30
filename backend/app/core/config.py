from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = Path(os.getenv("ECDAT_UPLOAD_DIR", BASE_DIR / "uploads"))
DATABASE_URL = os.getenv("ECDAT_DATABASE_URL", f"sqlite:///{BASE_DIR / 'ecdat.db'}")
DEFAULT_ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv("ECDAT_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS).split(",") if origin.strip()]
MAX_UPLOAD_BYTES = int(os.getenv("ECDAT_MAX_UPLOAD_BYTES", 50 * 1024 * 1024))
MAX_FILE_BYTES = int(os.getenv("ECDAT_MAX_FILE_BYTES", 1024 * 1024))
MAX_EXTRACTED_BYTES = int(os.getenv("ECDAT_MAX_EXTRACTED_BYTES", 250 * 1024 * 1024))
MAX_SNIPPET_LINES = 5

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
