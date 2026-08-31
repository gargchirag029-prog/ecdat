from pathlib import Path
from dataclasses import dataclass

from app.core.config import MAX_FILE_BYTES
from app.services.scanner.parser import extract_key_size, extract_variant, infer_purpose, snippet
from app.services.scanner.patterns import compile_rules
from app.services.scanner.signature_engine import scan_text
from app.utils.file_utils import IGNORED_PARTS, is_supported


@dataclass
class DetectedArtifact:
    algorithm: str
    variant: str | None
    key_size: int | None
    file: str
    line: int
    library: str | None
    api: str | None
    purpose: str
    confidence: str
    snippet: str


def _coerce_confidence(value):
    if isinstance(value, str):
        upper = value.upper()
        if upper in {"HIGH", "MEDIUM", "LOW"}:
            return upper
        return "MEDIUM"
    if value is None:
        return "MEDIUM"
    if value >= 0.95:
        return "HIGH"
    if value >= 0.6:
        return "MEDIUM"
    return "LOW"


def scan_project(root: Path) -> tuple[int, list[DetectedArtifact]]:
    artifacts: list[DetectedArtifact] = []
    files_scanned = 0
    rules = compile_rules()
    seen = set()
    for path in root.rglob("*"):
        if not path.is_file() or any(part in IGNORED_PARTS for part in path.parts) or not is_supported(path):
            continue
        try:
            if path.stat().st_size > MAX_FILE_BYTES:
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
        except (OSError, UnicodeError):
            continue
        files_scanned += 1
        lines = text.splitlines(keepends=True)
        relative_file = path.relative_to(root).as_posix()

        for item in scan_text(text, relative_file):
            method = item.get("detection_method")
            label = item.get("algorithm") or item.get("canonical_algorithm") or "Unknown"
            line_number = int(item.get("line") or 1)
            key = (relative_file, line_number, label, item.get("api"), method)
            if key in seen:
                continue
            seen.add(key)
            artifacts.append(DetectedArtifact(
                algorithm=label,
                variant=item.get("canonical_algorithm") or extract_variant(label, text),
                key_size=extract_key_size(item.get("evidence", "") or text) or extract_key_size(text) or extract_key_size(lines[line_number - 1] if line_number - 1 < len(lines) else ""),
                file=relative_file,
                line=line_number,
                library=item.get("library"),
                api=item.get("api"),
                purpose=item.get("usage") or infer_purpose(lines[line_number - 1] if line_number - 1 < len(lines) else "", label),
                confidence=_coerce_confidence(item.get("confidence")),
                snippet=snippet(lines, line_number),
            ))

        for line_number, line in enumerate(lines, 1):
            for rule, content_patterns, api_patterns in rules:
                matches = [pattern for pattern in content_patterns if pattern.search(line)]
                if not matches:
                    continue
                api_match = next((pattern.search(line) for pattern in api_patterns if pattern.search(line)), None)
                lowered = line.lower()
                is_negated = any(phrase in lowered for phrase in ("does not use", "doesn't use", "not use", "no use of"))
                confidence = "HIGH" if api_match else ("LOW" if is_negated or line.lstrip().startswith(("#", "//", "/*", "*")) else ("MEDIUM" if rule.algorithm in {"RSA", "ECDSA", "ECDH", "AES", "TLS/SSL"} else "LOW"))
                key = (relative_file, line_number, rule.algorithm, api_match.group(0) if api_match else None, "legacy_rule")
                if key in seen:
                    continue
                seen.add(key)
                artifacts.append(DetectedArtifact(
                    algorithm=rule.algorithm,
                    variant=extract_variant(rule.algorithm, line),
                    key_size=extract_key_size(line),
                    file=relative_file,
                    line=line_number,
                    library=rule.library,
                    api=api_match.group(0) if api_match else None,
                    purpose=infer_purpose(line, rule.algorithm),
                    confidence=confidence,
                    snippet=snippet(lines, line_number),
                ))
    return files_scanned, artifacts
