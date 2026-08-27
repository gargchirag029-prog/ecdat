import re


def extract_key_size(text: str) -> int | None:
    match = re.search(r"(?<!\d)(?:RSA|AES|key(?:Size|_size)?)[^0-9]{0,24}(1024|128|192|2048|224|256|3072|384|4096|512|521)(?!\d)", text, re.IGNORECASE)
    return int(match.group(1)) if match else None


def extract_variant(algorithm: str, text: str) -> str | None:
    key_size = extract_key_size(text)
    curve = re.search(r"\b(P-(?:256|384|521)|secp(?:256r1|384r1|521r1))\b", text, re.IGNORECASE)
    mode = re.search(r"\b(AES[-_ ]?(?:GCM|CBC|CTR))\b", text, re.IGNORECASE)
    digest = re.search(r"\bSHA[-_]?(1|224|256|384|512)\b|\bSHA(1|224|256|384|512)\b", text, re.IGNORECASE)
    if curve:
        value = curve.group(1).upper()
        return {"SECP256R1": "P-256", "SECP384R1": "P-384", "SECP521R1": "P-521"}.get(value, value)
    if mode:
        return mode.group(1).replace("_", "-").upper()
    if digest:
        return f"SHA-{next(group for group in digest.groups() if group)}"
    if key_size:
        return f"{algorithm}-{key_size}"
    return None


def infer_purpose(text: str, algorithm: str) -> str:
    lowered = text.lower()
    if algorithm == "TLS/SSL":
        return "TLS"
    if algorithm == "Certificate":
        return "Certificate"
    if algorithm == "ECDH" or "key exchange" in lowered or "key agreement" in lowered:
        return "Key Agreement"
    if "sign" in lowered or "signature" in lowered:
        return "Digital Signature"
    if "encrypt" in lowered:
        return "Encryption"
    if "decrypt" in lowered:
        return "Decryption"
    if "password" in lowered or "authentication" in lowered:
        return "Authentication"
    if algorithm == "SHA":
        return "Hashing"
    return "Unknown"


def snippet(lines: list[str], line_number: int, radius: int = 2) -> str:
    start = max(0, line_number - 1 - radius)
    end = min(len(lines), line_number + radius)
    return "".join(f"{index + 1}: {lines[index]}" for index in range(start, end))[:4000]
