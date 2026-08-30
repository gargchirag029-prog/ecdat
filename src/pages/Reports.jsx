import { useEffect, useState } from "react";
import { FileText, Download, Eye, Loader2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { getReports, generateReport, getCurrentScanId } from "../services/api";

function buildReadableReport(reportType, payload, scanId) {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));

  if (!payload) return "<p>No report data available.</p>";

  const metrics = [];
  const findings = [];

  if (reportType === "cbom") {
    const items = payload.artifacts || [];
    metrics.push(`<li><strong>Artifacts:</strong> ${items.length}</li>`);
    metrics.push(`<li><strong>Scan ID:</strong> ${escapeHtml(scanId || payload.scan_id || "N/A")}</li>`);
    if (items.length > 0) {
      findings.push(
        `<table><thead><tr><th>Algorithm</th><th>File</th><th>Risk</th><th>Recommendation</th></tr></thead><tbody>${items
          .slice(0, 10)
          .map(
            (item) => `<tr><td>${escapeHtml(item.algorithm || "Unknown")}</td><td>${escapeHtml(item.file || "Unknown")}</td><td>${escapeHtml(item.risk || "Unknown")}</td><td>${escapeHtml(item.recommendation || "Review and plan migration")}</td></tr>`
          )
          .join("")}</tbody></table>`
      );
    }
  } else if (reportType === "risk") {
    const critical = payload.critical || 0;
    const high = payload.high || 0;
    const medium = payload.medium || 0;
    const low = payload.low || 0;
    const topFindings = payload.top_findings || [];
    metrics.push(`<li><strong>Critical:</strong> ${critical}</li>`);
    metrics.push(`<li><strong>High:</strong> ${high}</li>`);
    metrics.push(`<li><strong>Medium:</strong> ${medium}</li>`);
    metrics.push(`<li><strong>Low:</strong> ${low}</li>`);
    findings.push(
      `<ul>${topFindings
        .slice(0, 10)
        .map(
          (item) => `<li>${escapeHtml(item.algorithm || "Unknown")} — ${escapeHtml(item.risk || "Unknown")} — ${escapeHtml(item.file || item.api || "Unknown")}</li>`
        )
        .join("")}</ul>`
    );
  } else if (reportType === "pqc") {
    const readiness = payload.readiness_score || 0;
    const candidates = payload.migration_candidates || 0;
    const vulnerable = payload.quantum_vulnerable || 0;
    const priorities = payload.top_priorities || [];
    metrics.push(`<li><strong>PQC Readiness:</strong> ${readiness}%</li>`);
    metrics.push(`<li><strong>Migration Candidates:</strong> ${candidates}</li>`);
    metrics.push(`<li><strong>Quantum Vulnerable:</strong> ${vulnerable}</li>`);
    findings.push(
      `<ul>${priorities
        .slice(0, 10)
        .map(
          (item) => `<li>${escapeHtml(item.algorithm || "Unknown")} — ${escapeHtml(item.risk || "Unknown")} — ${escapeHtml(item.recommendation || "Review migration path")}</li>`
        )
        .join("")}</ul>`
    );
  } else {
    const totalAssets = payload.total_assets || 0;
    const high = payload.high || 0;
    const quantum = payload.quantum_vulnerable || 0;
    const readiness = payload.pqc_readiness || 0;
    metrics.push(`<li><strong>Total Assets:</strong> ${totalAssets}</li>`);
    metrics.push(`<li><strong>High Risk:</strong> ${high}</li>`);
    metrics.push(`<li><strong>Quantum Vulnerable:</strong> ${quantum}</li>`);
    metrics.push(`<li><strong>PQC Readiness:</strong> ${readiness}%</li>`);
  }

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>CRYPT AI Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; background: #f8fafc; }
          .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 12px; margin-bottom: 24px; }
          h1 { color: #0f172a; margin: 0; }
          .meta { color: #475569; margin-top: 8px; }
          .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(15,23,42,.04); }
          ul { line-height: 1.8; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; vertical-align: top; }
          th { background: #e0f2fe; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CRYPT AI Security Report</h1>
          <div class="meta">Report Type: ${escapeHtml(reportType.toUpperCase())} &nbsp;|&nbsp; Scan ID: ${escapeHtml(scanId || "N/A")}</div>
        </div>

        <div class="card">
          <h2>Summary</h2>
          <ul>${metrics.join("")}</ul>
        </div>

        <div class="card">
          <h2>Key Findings</h2>
          ${findings.length ? findings.join("") : "<p>No findings available.</p>"}
        </div>
      </body>
    </html>
  `;
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState({});
  const [ready, setReady] = useState({});
  const [generatedReports, setGeneratedReports] = useState({});
  const scanId = getCurrentScanId();

  useEffect(() => {
    if (scanId) {
      getReports(scanId).then((data) => setReports(data || []));
    }
  }, [scanId]);

  const handleGenerate = async (reportType) => {
    setGenerating((g) => ({ ...g, [reportType]: true }));
    const result = await generateReport(scanId, reportType);
    setGenerating((g) => ({ ...g, [reportType]: false }));

    if (result?.data) {
      setGeneratedReports((prev) => ({ ...prev, [reportType]: result.data }));
      setReady((r) => ({ ...r, [reportType]: true }));
    }
  };

  const buildReportBlob = (reportType) => {
    const payload = generatedReports[reportType];
    if (!payload) return null;

    const htmlReport = buildReadableReport(reportType, payload, scanId);
    return new Blob([htmlReport], { type: "text/html;charset=utf-8" });
  };

  const handleView = (reportType) => {
    const blob = buildReportBlob(reportType);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const previewWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (previewWindow) {
      previewWindow.opener = null;
    }
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const handleDownload = (reportType) => {
    const blob = buildReportBlob(reportType);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${reportType}-report-${scanId || "scan"}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Reports" subtitle="Generate and export cryptographic security reports.">
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="text-center">
            <Upload size={48} className="mx-auto mb-4 text-mist-400" />
            <h2 className="font-display text-2xl font-semibold text-mist-100 mb-2">No Reports Available</h2>
            <p className="text-mist-500 mb-6 max-w-md">
              Upload a project and scan for cryptographic artifacts to generate reports.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-ink-950 font-semibold rounded-lg transition-colors"
            >
              <Upload size={16} />
              Scan Project
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-mist-100">Reports</h2>
            <p className="text-mist-500 text-sm mt-1">Generate and export cryptographic security reports.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => (
              <div key={r.id} className="panel p-5 flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                  <FileText size={18} className="text-cyan-400" />
                </div>
                <h3 className="font-display font-semibold text-mist-100">{r.title}</h3>
                <p className="text-xs text-mist-500 mt-1.5 flex-1">{r.description}</p>

                {ready[r.id] && (
                  <div className="text-[11px] text-cyan-400 font-mono mb-3 mt-4">✓ Report ready</div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    className="flex-1 !py-2 !text-xs"
                    onClick={() => handleGenerate(r.id)}
                    disabled={generating[r.id]}
                  >
                    {generating[r.id] ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                    {generating[r.id] ? "Generating…" : "Generate Report"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="!py-2 !px-2.5"
                    disabled={!ready[r.id] || !generatedReports[r.id]}
                    title="View"
                    onClick={() => handleView(r.id)}
                  >
                    <Eye size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    className="!py-2 !px-2.5"
                    disabled={!ready[r.id] || !generatedReports[r.id]}
                    title="Export"
                    onClick={() => handleDownload(r.id)}
                  >
                    <Download size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
