// Centralized mock data for ECDAT. In production this is served by the FastAPI backend
// (see src/services/api.js for the swap points).

export const stats = {
  assetsScanned: 1248,
  cryptoArtifacts: 86,
  highRisk: 24,
  pqcCandidates: 31,
  pqcReadiness: 38,
};

export const algorithmDistribution = [
  { name: "RSA", value: 24 },
  { name: "ECC", value: 14 },
  { name: "ECDSA", value: 18 },
  { name: "ECDH", value: 11 },
  { name: "AES", value: 15 },
  { name: "SHA-256", value: 4 },
];

export const riskDistribution = [
  { name: "Critical", value: 8, color: "#e5586b" },
  { name: "High", value: 16, color: "#e8a13c" },
  { name: "Medium", value: 31, color: "#9d7bf0" },
  { name: "Low", value: 31, color: "#2dd4bf" },
];

export const systems = [
  { id: "sys-1", name: "Payment API", algorithm: "RSA-2048", risk: "CRITICAL", priority: "Critical", status: "Not Started" },
  { id: "sys-2", name: "Authentication Service", algorithm: "ECDSA P-256", risk: "HIGH", priority: "High", status: "Planning" },
  { id: "sys-3", name: "VPN Gateway", algorithm: "ECDH P-256", risk: "HIGH", priority: "High", status: "Planning" },
  { id: "sys-4", name: "Customer Portal", algorithm: "RSA-2048", risk: "MEDIUM", priority: "Medium", status: "Scheduled" },
  { id: "sys-5", name: "Internal Application", algorithm: "AES-256", risk: "LOW", priority: "Low", status: "Monitoring" },
];

export const recentScans = [
  { id: "scan-241", project: "payment-gateway-service", date: "2026-08-26 14:32", filesScanned: 3120, artifactsFound: 22, status: "Complete" },
  { id: "scan-240", project: "customer-portal-web", date: "2026-08-25 09:14", filesScanned: 1876, artifactsFound: 14, status: "Complete" },
  { id: "scan-239", project: "vpn-gateway-core", date: "2026-08-23 17:02", filesScanned: 942, artifactsFound: 9, status: "Complete" },
  { id: "scan-238", project: "auth-service", date: "2026-08-21 11:48", filesScanned: 1204, artifactsFound: 12, status: "Complete" },
];

export const cryptoArtifacts = [
  {
    id: 1,
    algorithm: "RSA",
    keySize: "2048",
    file: "login.py",
    line: 42,
    library: "cryptography",
    purpose: "Authentication",
    risk: "HIGH",
    quantumStatus: "Vulnerable",
    priority: "High",
    application: "Authentication Service",
    snippet: "rsa_key = RSA.generate(2048)",
    dependencies: ["cryptography==41.0.3", "OpenSSL 3.0"],
    usedIn: ["login.py:42", "session_manager.py:88", "token_signer.py:15"],
  },
  {
    id: 2,
    algorithm: "ECDSA",
    keySize: "P-256",
    file: "server.js",
    line: 71,
    library: "OpenSSL",
    purpose: "Digital Signature",
    risk: "HIGH",
    quantumStatus: "Vulnerable",
    priority: "High",
    application: "VPN Gateway",
    snippet: "const sig = crypto.createSign('SHA256').sign(ecdsaKey);",
    dependencies: ["openssl 3.1.2", "node:crypto"],
    usedIn: ["server.js:71", "handshake.js:19"],
  },
  {
    id: 3,
    algorithm: "ECDH",
    keySize: "P-256",
    file: "tls.py",
    line: 33,
    library: "OpenSSL",
    purpose: "Key Agreement",
    risk: "HIGH",
    quantumStatus: "Vulnerable",
    priority: "High",
    application: "VPN Gateway",
    snippet: "shared_key = ecdh.exchange(ec.ECDH(), peer_public_key)",
    dependencies: ["cryptography==41.0.3"],
    usedIn: ["tls.py:33"],
  },
  {
    id: 4,
    algorithm: "AES",
    keySize: "256",
    file: "database.py",
    line: 18,
    library: "cryptography",
    purpose: "Encryption",
    risk: "LOW",
    quantumStatus: "Review",
    priority: "Low",
    application: "Internal Application",
    snippet: "cipher = AES.new(key, AES.MODE_GCM)",
    dependencies: ["cryptography==41.0.3"],
    usedIn: ["database.py:18", "backup_service.py:52"],
  },
  {
    id: 5,
    algorithm: "SHA-256",
    keySize: "—",
    file: "auth.py",
    line: 22,
    library: "hashlib",
    purpose: "Hashing",
    risk: "LOW",
    quantumStatus: "Lower Concern",
    priority: "Low",
    application: "Authentication Service",
    snippet: "digest = hashlib.sha256(payload).hexdigest()",
    dependencies: ["python-stdlib"],
    usedIn: ["auth.py:22", "integrity_check.py:9"],
  },
  {
    id: 6,
    algorithm: "RSA",
    keySize: "2048",
    file: "payment_processor.py",
    line: 104,
    library: "cryptography",
    purpose: "Transaction Signing",
    risk: "CRITICAL",
    quantumStatus: "Vulnerable",
    priority: "Critical",
    application: "Payment API",
    snippet: "signature = private_key.sign(data, padding.PKCS1v15(), hashes.SHA256())",
    dependencies: ["cryptography==41.0.3", "OpenSSL 3.0"],
    usedIn: ["payment_processor.py:104", "invoice_signer.py:31"],
  },
  {
    id: 7,
    algorithm: "ECDSA",
    keySize: "P-384",
    file: "cert_manager.js",
    line: 58,
    library: "OpenSSL",
    purpose: "Certificate Signing",
    risk: "MEDIUM",
    quantumStatus: "Vulnerable",
    priority: "Medium",
    application: "Customer Portal",
    snippet: "const cert = generateCert(ecdsaP384Key);",
    dependencies: ["openssl 3.1.2"],
    usedIn: ["cert_manager.js:58"],
  },
  {
    id: 8,
    algorithm: "AES",
    keySize: "128",
    file: "session_cache.py",
    line: 9,
    library: "cryptography",
    purpose: "Session Encryption",
    risk: "MEDIUM",
    quantumStatus: "Review",
    priority: "Medium",
    application: "Customer Portal",
    snippet: "cipher = AES.new(session_key, AES.MODE_CBC, iv)",
    dependencies: ["cryptography==41.0.3"],
    usedIn: ["session_cache.py:9"],
  },
];

export const riskFindings = [
  { rank: 1, system: "Payment API", algorithm: "RSA-2048", risk: "CRITICAL", impact: 5, likelihood: 4 },
  { rank: 2, system: "VPN Gateway", algorithm: "ECDH P-256", risk: "HIGH", impact: 4, likelihood: 4 },
  { rank: 3, system: "Authentication Service", algorithm: "ECDSA P-256", risk: "HIGH", impact: 4, likelihood: 3 },
  { rank: 4, system: "Customer Portal", algorithm: "RSA-2048", risk: "MEDIUM", impact: 3, likelihood: 3 },
];

export const riskSummary = { critical: 8, high: 16, medium: 31, low: 31 };

export const quantumVulnerable = ["RSA", "ECDSA", "ECDH"];
export const lowerPqcConcern = ["AES-256", "SHA-256"];

export const pqcMigrationTable = [
  { system: "Payment API", current: "RSA-2048", priority: "Critical", status: "Not Started", direction: "Evaluate appropriate PQ signature mechanism based on use case." },
  { system: "VPN Gateway", current: "ECDH P-256", priority: "High", status: "Planning", direction: "Evaluate ML-KEM for key establishment." },
  { system: "Authentication Service", current: "ECDSA P-256", priority: "High", status: "Planning", direction: "Evaluate ML-DSA for signing operations." },
  { system: "Customer Portal", current: "RSA-2048", priority: "Medium", status: "Scheduled", direction: "Evaluate appropriate PQ signature mechanism based on use case." },
  { system: "Internal Application", current: "AES-256", priority: "Low", status: "Monitoring", direction: "Increase key size / monitor NIST guidance; symmetric primitives are lower concern." },
];

export const reports = [
  { id: "r1", title: "Cryptographic Inventory Report", description: "Full CBOM export across all scanned assets." },
  { id: "r2", title: "Risk Assessment Report", description: "Prioritized risk findings with impact and likelihood." },
  { id: "r3", title: "CBOM Report", description: "Structured cryptography bill of materials, SBOM-compatible." },
  { id: "r4", title: "PQC Readiness Report", description: "Organization-wide post-quantum readiness scoring." },
  { id: "r5", title: "Migration Priority Report", description: "Ranked migration roadmap by system and algorithm." },
];

export const aiSuggestedQuestions = [
  "Why is RSA-2048 considered a migration priority?",
  "What should we migrate first?",
  "Explain my PQC readiness score.",
  "Which applications use ECC?",
  "What are the highest-risk cryptographic assets?",
];

export const aiMockResponses = {
  "why is rsa-2048 considered a migration priority?":
    "RSA-2048 appears in 3 critical-path systems, including the Payment API. It relies on integer factorization, which is efficiently broken by a sufficiently large quantum computer running Shor's algorithm. Because certificate and key-rotation lead times are long, ECDAT flags it early even though no such computer exists today.",
  "what should we migrate first?":
    "Based on the current CBOM, the Payment API's RSA-2048 transaction signing is the top priority — it's rated CRITICAL on both impact and likelihood. VPN Gateway (ECDH P-256) and Authentication Service (ECDSA P-256) follow as HIGH priority.",
  "explain my pqc readiness score.":
    "Your organization's PQC readiness score is 38%. This reflects the proportion of cryptographic artifacts that are either already quantum-resistant or have a documented migration plan. 31 artifacts are flagged as PQC candidates requiring evaluation.",
  "which applications use ecc?":
    "ECC-family algorithms (ECDSA, ECDH) appear in the VPN Gateway, Customer Portal, and parts of the Authentication Service — mainly for TLS key agreement and certificate/document signing.",
  "what are the highest-risk cryptographic assets?":
    "The highest-risk assets are RSA-2048 in the Payment API's transaction signer and ECDH P-256 in the VPN Gateway's TLS handshake — both are CRITICAL/HIGH risk and sit on customer-facing critical paths.",
  default:
    "Based on your current cryptographic inventory, I can help analyze algorithm usage, risk levels, and PQC migration priorities. Try asking about a specific system, algorithm, or your readiness score.",
};
