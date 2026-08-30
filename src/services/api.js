// Connected to FastAPI backend at http://localhost:8000
const API_BASE = "http://localhost:8000";

// Store current scan context
let currentScanId = null;

export function getCurrentScanId() {
  return currentScanId;
}

export function setCurrentScanId(scanId) {
  currentScanId = scanId;
  if (scanId) localStorage.setItem("currentScanId", scanId);
  else localStorage.removeItem("currentScanId");
}

// Initialize from localStorage if available
if (typeof window !== "undefined") {
  currentScanId = localStorage.getItem("currentScanId");
}

// Helper to handle API responses
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail?.message || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Upload a project zip file
export async function uploadScan(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const response = await fetch(`${API_BASE}/api/scan/upload`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    setCurrentScanId(data.scan_id);
    return data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

// Start the scan process
export async function startScan(scanId) {
  return fetchAPI(`/api/scan/${scanId}/start`, { method: "POST" });
}

// Get scan status
export async function getScanStatus(scanId) {
  return fetchAPI(`/api/scan/${scanId}`);
}

// Get dashboard data
export async function getDashboardStats(scanId = currentScanId) {
  if (!scanId) return null;
  try {
    const data = await fetchAPI(`/api/dashboard/${scanId}`);
    return {
      assetsScanned: data.total_assets || 0,
      cryptoArtifacts: data.total_assets || 0,
      highRisk: data.high || 0,
      pqcCandidates: data.quantum_vulnerable || 0,
      pqcReadiness: data.pqc_readiness || 0,
    };
  } catch {
    return null;
  }
}

// Get algorithm distribution
export async function getAlgorithmDistribution(scanId = currentScanId) {
  if (!scanId) return [];
  try {
    const inventory = await getInventory(scanId);
    const algorithms = {};
    
    inventory.forEach((item) => {
      const algo = item.algorithm;
      algorithms[algo] = (algorithms[algo] || 0) + 1;
    });
    
    return Object.entries(algorithms).map(([name, value]) => ({ name, value }));
  } catch {
    return [];
  }
}

// Get risk distribution
export async function getRiskDistribution(scanId = currentScanId) {
  if (!scanId) return [];
  try {
    const data = await fetchAPI(`/api/risks/${scanId}`);
    return [
      { name: "Critical", value: data.critical || 0, color: "#e5586b" },
      { name: "High", value: data.high || 0, color: "#e8a13c" },
      { name: "Medium", value: data.medium || 0, color: "#9d7bf0" },
      { name: "Low", value: data.low || 0, color: "#2dd4bf" },
    ];
  } catch {
    return [];
  }
}

// Get systems/top priorities
export async function getSystems(scanId = currentScanId) {
  if (!scanId) return [];
  try {
    const inventory = await getInventory(scanId);
    return inventory
      .filter((item) => item.risk && item.risk !== "LOW")
      .slice(0, 5)
      .map((item, idx) => ({
        id: `sys-${idx}`,
        name: item.file || `${item.algorithm} in unknown`,
        algorithm: item.algorithm,
        risk: item.risk,
        priority: item.risk === "CRITICAL" ? "Critical" : item.risk === "HIGH" ? "High" : "Medium",
        status: "Pending Review",
      }));
  } catch {
    return [];
  }
}

// Get recent scans
export async function getRecentScans(scanId = currentScanId) {
  if (!scanId) return [];
  try {
    const scan = await getScanStatus(scanId);
    if (!scan) return [];
    return [
      {
        id: scan.scan_id,
        project: scan.filename,
        date: new Date(scan.created_at).toLocaleString(),
        filesScanned: scan.files_scanned,
        artifactsFound: scan.artifacts_found,
        status: scan.status === "completed" ? "Complete" : "In Progress",
      },
    ];
  } catch {
    return [];
  }
}

// Get inventory
export async function getInventory(scanId = currentScanId, filters = {}) {
  if (!scanId) return [];
  try {
    const params = new URLSearchParams();
    params.append("page", filters.page || 1);
    params.append("limit", filters.limit || 200);
    
    if (filters.algorithm) params.append("algorithm", filters.algorithm);
    if (filters.risk) params.append("risk", filters.risk);
    if (filters.purpose) params.append("purpose", filters.purpose);
    if (filters.search) params.append("search", filters.search);
    
    const data = await fetchAPI(`/api/inventory/${scanId}?${params.toString()}`);
    return data.items || [];
  } catch {
    return [];
  }
}

// Get artifact details
export async function getArtifact(artifactId) {
  if (!artifactId) return null;
  try {
    return await fetchAPI(`/api/inventory/artifact/${artifactId}`);
  } catch {
    return null;
  }
}

// Get risk analysis
export async function getRiskAnalysis(scanId = currentScanId) {
  if (!scanId) return null;
  try {
    const data = await fetchAPI(`/api/risks/${scanId}`);
    const inventory = await getInventory(scanId);
    
    return {
      riskFindings: inventory
        .filter((item) => item.risk !== "LOW")
        .slice(0, 10)
        .map((item, idx) => ({
          rank: idx + 1,
          system: item.file || item.algorithm,
          algorithm: item.algorithm,
          risk: item.risk,
          impact: item.risk === "CRITICAL" ? 5 : item.risk === "HIGH" ? 4 : 3,
          likelihood: Math.floor(item.risk_score / 25) + 1,
        })),
      riskSummary: {
        critical: data.critical || 0,
        high: data.high || 0,
        medium: data.medium || 0,
        low: data.low || 0,
      },
    };
  } catch {
    return null;
  }
}

// Get PQC readiness
export async function getPqcReadiness(scanId = currentScanId) {
  if (!scanId) return null;
  try {
    const data = await fetchAPI(`/api/pqc/${scanId}`);
    const inventory = await getInventory(scanId);
    
    const quantumVulnerable = ["RSA", "ECDSA", "ECDH"];
    const lowerPqcConcern = ["AES-256", "SHA-256"];
    
    return {
      readiness: data.readiness_score || 0,
      pqcMigrationTable: inventory
        .filter((item) => item.pqc_migration)
        .slice(0, 10)
        .map((item) => ({
          system: item.file || item.algorithm,
          current: `${item.algorithm}${item.key_size ? `-${item.key_size}` : ""}`,
          priority: item.risk === "CRITICAL" ? "Critical" : item.risk === "HIGH" ? "High" : "Medium",
          status: "Pending Review",
          direction: item.recommendation || "Review and plan migration",
        })),
      quantumVulnerable,
      lowerPqcConcern,
    };
  } catch {
    return null;
  }
}

// Get reports/CBOM
export async function getReports(scanId = currentScanId) {
  if (!scanId) return [];
  try {
    return [
      { id: "cbom", title: "Cryptographic Inventory Report", description: "Full CBOM export across all scanned assets." },
      { id: "risk", title: "Risk Assessment Report", description: "Prioritized risk findings with impact and likelihood." },
      { id: "pqc", title: "PQC Readiness Report", description: "Organization-wide post-quantum readiness scoring." },
      { id: "summary", title: "Migration Priority Report", description: "Ranked migration roadmap by system and algorithm." },
    ];
  } catch {
    return [];
  }
}

// Generate report using the current scan context and the real backend endpoints
export async function generateReport(scanId = currentScanId, reportType = "cbom") {
  if (!scanId) return null;
  try {
    let endpoint = "/api/cbom/";
    if (reportType === "risk") endpoint = "/api/risks/";
    else if (reportType === "pqc") endpoint = "/api/pqc/";
    else if (reportType === "summary") endpoint = "/api/dashboard/";

    const data = await fetchAPI(`${endpoint}${scanId}`);
    return {
      id: `${reportType}-${Date.now()}`,
      status: "ready",
      generatedAt: new Date().toISOString(),
      data,
    };
  } catch {
    return null;
  }
}

// Ask AI assistant using the current scan's real data
export async function askAssistant(question) {
  const scanId = currentScanId;
  const q = (question || "").toLowerCase();

  if (!scanId) {
    return "No scan data available. Please upload a project to analyze your cryptographic landscape.";
  }

  try {
    const [inventory, riskData, pqcData, dashboard] = await Promise.all([
      getInventory(scanId),
      getRiskAnalysis(scanId),
      getPqcReadiness(scanId),
      getDashboardStats(scanId),
    ]);

    const totalArtifacts = inventory?.length || 0;
    const riskSummary = riskData?.riskSummary || {};
    const riskFindings = riskData?.riskFindings || [];
    const readiness = pqcData?.readiness ?? 0;
    const pqcTable = pqcData?.pqcMigrationTable || [];
    const topFindings = riskFindings.slice(0, 3);
    const topPriority = pqcTable[0];

    if (!totalArtifacts) {
      return "The current scan has no discovered artifacts yet. Upload a project and wait for the scan to finish before asking questions.";
    }

    if (q.includes("critical") || q.includes("risk") || q.includes("highest") || q.includes("priority")) {
      return `Your current scan found ${riskSummary.critical || 0} critical, ${riskSummary.high || 0} high, ${riskSummary.medium || 0} medium, and ${riskSummary.low || 0} low risk findings across ${totalArtifacts} artifacts. The most urgent issues are ${topFindings.map((item) => `${item.algorithm} (${item.risk})`).join(", ") || "currently limited to the active scan results"}.`;
    }

    if (q.includes("pqc") || q.includes("quantum") || q.includes("migration") || q.includes("readiness")) {
      return `Your PQC readiness is ${readiness}% based on ${pqcTable.length || 0} migration candidates. The most important migration target is ${topPriority ? `${topPriority.system} using ${topPriority.current}` : "the scan results currently underway"}. Focus first on algorithm classes that are still quantum-vulnerable and prioritize the highest-risk systems.`;
    }

    if (q.includes("algorithm") || q.includes("crypto") || q.includes("inventory")) {
      const common = inventory
        .reduce((acc, item) => {
          acc[item.algorithm] = (acc[item.algorithm] || 0) + 1;
          return acc;
        }, {});
      const topAlgorithm = Object.entries(common).sort((a, b) => b[1] - a[1])[0];
      return `The current scan identified ${totalArtifacts} cryptographic artifacts. The most frequent algorithm family is ${topAlgorithm ? `${topAlgorithm[0]} (${topAlgorithm[1]} matches)` : "not yet available"}. The broader inventory includes ${inventory.slice(0, 3).map((item) => item.algorithm).join(", ") || "recent scan results"}.`;
    }

    if (q.includes("how") || q.includes("improve") || q.includes("next")) {
      return `To improve posture, prioritize the highest-risk findings and the quantum-vulnerable algorithms. Based on the current scan, start with ${topFindings.length ? topFindings.map((item) => item.algorithm).join(", ") : "the top risk findings"}, then migrate the most urgent PQC candidates such as ${topPriority ? `${topPriority.current}` : "the tracked migration list"}.`;
    }

    return `The current scan shows ${dashboard?.assetsScanned || totalArtifacts} assets, ${dashboard?.highRisk || riskSummary.high || 0} high-risk findings, and PQC readiness of ${readiness}%. Review the top risk findings and migration candidates for the most immediate mitigation work.`;
  } catch (error) {
    console.error("AI assistant analysis failed:", error);
    return "I couldn’t analyze the current scan because the data is unavailable right now. Please upload a project and wait for the scan to finish before asking again.";
  }
}

// Upload and start scan
export async function runScanSimulation(onStep) {
  // This is kept for backward compatibility but now runs real scan
  throw new Error("Use uploadScan and startScan instead");
}
