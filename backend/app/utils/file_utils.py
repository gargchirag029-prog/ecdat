from pathlib import Path, PurePosixPath
import re
import shutil
import zipfile

from fastapi import HTTPException, UploadFile

from app.core.config import MAX_EXTRACTED_BYTES, MAX_UPLOAD_BYTES, UPLOAD_DIR

SUPPORTED_EXTENSIONS = {".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".c", ".h", ".cpp", ".hpp", ".go", ".php", ".rb", ".yaml", ".yml", ".json", ".xml", ".pem", ".crt", ".cer", ".conf", ".cfg", ".ini", ".env.example"}
IGNORED_PARTS = {".git", "node_modules", "__pycache__", "build", "dist", ".venv", "venv"}


def safe_filename(name: str) -> str:
    cleaned = Path(name or "project.zip").name
    return re.sub(r"[^A-Za-z0-9._-]", "_", cleaned)[:255]


def is_supported(path: Path) -> bool:
    return path.suffix.lower() in SUPPORTED_EXTENSIONS


def safe_extract(zip_path: Path, destination: Path) -> None:
    total_size = 0
    try:
        archive = zipfile.ZipFile(zip_path)
    except zipfile.BadZipFile as error:
        raise HTTPException(status_code=400, detail={"code": "invalid_zip", "message": "The uploaded file is not a valid ZIP archive"}) from error
    with archive:
        for member in archive.infolist():
            member_path = PurePosixPath(member.filename)
            if member_path.is_absolute() or ".." in member_path.parts:
                raise HTTPException(status_code=400, detail={"code": "unsafe_archive", "message": "ZIP contains an unsafe path"})
            total_size += member.file_size
            if total_size > MAX_EXTRACTED_BYTES:
                raise HTTPException(status_code=400, detail={"code": "archive_too_large", "message": "Extracted project exceeds the size limit"})
            target = (destination / Path(*member_path.parts)).resolve()
            if destination.resolve() not in target.parents and target != destination.resolve():
                raise HTTPException(status_code=400, detail={"code": "unsafe_archive", "message": "ZIP contains an unsafe path"})
        archive.extractall(destination)


def store_upload(upload: UploadFile, scan_id: str) -> tuple[Path, Path]:
    if not upload.filename or not upload.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail={"code": "invalid_file_type", "message": "Only ZIP project files are accepted"})
    root = UPLOAD_DIR / scan_id
    root.mkdir(parents=True, exist_ok=False)
    zip_path = root / safe_filename(upload.filename)
    written = 0
    try:
        with zip_path.open("wb") as output:
            while chunk := upload.file.read(1024 * 1024):
                written += len(chunk)
                if written > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=400, detail={"code": "upload_too_large", "message": "Upload exceeds the size limit"})
                output.write(chunk)
        extracted = root / "project"
        extracted.mkdir()
        safe_extract(zip_path, extracted)
        return zip_path, extracted
    except Exception:
        shutil.rmtree(root, ignore_errors=True)
        raise
