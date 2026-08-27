// Mock API layer. Every function returns a Promise so page components already
// use the async shape they'll need once a real FastAPI backend is wired in.
//
// Swap plan for FastAPI:
//   GET  /api/dashboard/stats            -> getDashboardStats()
//   GET  /api/dashboard/algorithms       -> getAlgorithmDistribution()
//   GET  /api/dashboard/risk-distribution-> getRiskDistribution()
//   GET  /api/systems                    -> getSystems()
//   GET  /api/scans/recent               -> getRecentScans()
//   POST /api/scans                      -> startScan(file)   (multipart upload)
//   GET  /api/scans/:id                  -> getScanStatus(id) (poll or websocket)
//   GET  /api/inventory                  -> getInventory(filters)
//   GET  /api/inventory/:id              -> getArtifact(id)
//   GET  /api/risks                      -> getRiskAnalysis()
//   GET  /api/pqc/readiness              -> getPqcReadiness()
//   POST /api/ai/query                   -> askAssistant(question)
//   GET  /api/reports                    -> getReports()
//   POST /api/reports/:id/generate       -> generateReport(id)
//
// Each mock function below is the seam where a real `fetch(base + path)` call
// will replace the in-memory data, keeping page components unchanged.

import {
  stats,
  algorithmDistribution,
  riskDistribution,
  systems,
  recentScans,
  cryptoArtifacts,
  riskFindings,
  riskSummary,
  pqcMigrationTable,
  reports,
  aiMockResponses,
} from "../data/mockData";

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export async function getDashboardStats() {
  await delay(300);
  return stats;
}

export async function getAlgorithmDistribution() {
  await delay(300);
  return algorithmDistribution;
}

export async function getRiskDistribution() {
  await delay(300);
  return riskDistribution;
}

export async function getSystems() {
  await delay(300);
  return systems;
}

export async function getRecentScans() {
  await delay(300);
  return recentScans;
}

export async function getInventory() {
  await delay(300);
  return cryptoArtifacts;
}

export async function getArtifact(id) {
  await delay(200);
  return cryptoArtifacts.find((a) => String(a.id) === String(id));
}

export async function getRiskAnalysis() {
  await delay(300);
  return { riskFindings, riskSummary };
}

export async function getPqcReadiness() {
  await delay(300);
  return { readiness: stats.pqcReadiness, pqcMigrationTable };
}

export async function getReports() {
  await delay(200);
  return reports;
}

export async function generateReport(id) {
  await delay(1200);
  return { id, status: "ready", generatedAt: new Date().toISOString() };
}

export async function askAssistant(question) {
  await delay(900);
  const key = question.trim().toLowerCase();
  return aiMockResponses[key] || aiMockResponses.default;
}

// Simulates a multi-stage scan pipeline. onStep is called after each stage completes.
export async function runScanSimulation(onStep) {
  const stages = [
    "Discovering files",
    "Analyzing source code",
    "Detecting cryptographic APIs",
    "Building CBOM",
    "Calculating risk",
    "PQC analysis",
  ];
  for (let i = 0; i < stages.length; i++) {
    await delay(650);
    onStep(i, stages[i]);
  }
  await delay(300);
  return {
    filesScanned: 1876,
    artifactsFound: 14,
    highRiskFindings: 4,
    pqcCandidates: 6,
  };
}
