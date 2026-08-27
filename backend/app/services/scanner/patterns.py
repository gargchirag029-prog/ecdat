from dataclasses import dataclass
import re


@dataclass(frozen=True)
class DetectionRule:
    algorithm: str
    patterns: tuple[str, ...]
    api_patterns: tuple[str, ...] = ()
    library: str | None = None
    confidence: str = "MEDIUM"


RULES = (
    DetectionRule("RSA", (r"\bRSA(?:[-/]?(?:PSS|ECB))?\b", r"\brsa\b"), (r"RSA\.(?:generate|import_key)", r"rsa\.(?:generate|generate_private_key|encrypt|decrypt)"), "cryptography/PyCryptodome"),
    DetectionRule("ECDSA", (r"\bECDSA\b",), (r"ec\.ECDSA", r"createSign", r"ecdsa[_ .]?(?:sign|key)"), "cryptography/OpenSSL"),
    DetectionRule("ECDH", (r"\bECDH\b",), (r"ec\.ECDH", r"\.exchange\(", r"ecdh[_ .]?(?:exchange|key)"), "cryptography/OpenSSL"),
    DetectionRule("ECC", (r"\bECC\b", r"Elliptic Curve", r"\bP-(?:256|384|521)\b", r"\bsecp(?:256r1|384r1|521r1)\b"), (), "cryptography/OpenSSL"),
    DetectionRule("AES", (r"\bAES\b", r"AES[-_](?:128|192|256)", r"AES[-_](?:GCM|CBC|CTR)"), (r"AES\.new", r"Cipher\.", r"createCipheriv"), "cryptography/PyCryptodome"),
    DetectionRule("SHA", (r"\bSHA[-_]?(?:1|224|256|384|512)\b", r"hashlib\.sha(?:1|224|256|384|512)"), (), "hashlib/cryptography"),
    DetectionRule("TLS/SSL", (r"\bTLS(?:v1(?:\.2|\.3)?)?\b", r"\bSSL\b", r"SSLContext", r"ssl\.create_default_context"), (), "ssl/OpenSSL"),
    DetectionRule("Certificate", (r"\.(?:pem|crt|cer)\b", r"certificate", r"X\.?509", r"x509"), (), "certificate store/OpenSSL"),
)


def compile_rules():
    return tuple((rule, tuple(re.compile(pattern, re.IGNORECASE) for pattern in rule.patterns), tuple(re.compile(pattern, re.IGNORECASE) for pattern in rule.api_patterns)) for rule in RULES)
