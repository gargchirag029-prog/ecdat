import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getPqcReadiness, getCurrentScanId } from "../services/api";

export default function PQCReadiness() {
  const [data, setData] = useState(null);
  const scanId = getCurrentScanId();

  useEffect(() => {
    if (scanId) {
      getPqcReadiness(scanId).then(setData);
    }
  }, [scanId]);

  if (!data) {
    return (
      <Layout title="PQC Readiness">
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="text-center">
            <Upload size={48} className="mx-auto mb-4 text-mist-400" />
            <h2 className="font-display text-2xl font-semibold text-mist-100 mb-2">No PQC Data Available</h2>
            <p className="text-mist-500 mb-6 max-w-md">
              Upload a project to assess your post-quantum cryptography readiness.
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
      </Layout>
    );
  }

  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (data.readiness / 100) * circumference;

  return (
    <Layout title="PQC Readiness" subtitle="Post-Quantum Cryptography Readiness">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-mist-100">Post-Quantum Cryptography Readiness</h2>
        <p className="text-mist-500 text-sm mt-1">
          Track exposure to quantum-vulnerable algorithms and migration progress.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mb-6">
        <div className="lg:col-span-2 panel p-6 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="#1c2635" strokeWidth="12" />
              <circle
                cx="80" cy="80" r="70" fill="none"
                stroke="url(#pqcGradient)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
              />
              <defs>
                <linearGradient id="pqcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#9d7bf0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-display font-semibold text-mist-100">{data.readiness}%</span>
              <span className="text-[11px] text-mist-500 mt-1 text-center px-4">Current PQC Readiness</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
          {data.quantumVulnerable && data.quantumVulnerable.length > 0 && (
            <div className="panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-signal-rose" />
                <h3 className="font-display font-semibold text-mist-100 text-sm">Quantum-Vulnerable Algorithms</h3>
              </div>
              <div className="space-y-2">
                {data.quantumVulnerable.map((algo) => (
                  <div key={algo} className="flex items-center justify-between px-3 py-2 rounded-lg bg-signal-rose/5 border border-signal-rose/20">
                    <span className="text-sm text-mist-100 font-mono">{algo}</span>
                    <span className="text-[10px] uppercase text-signal-rose font-mono">Migrate</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.lowerPqcConcern && data.lowerPqcConcern.length > 0 && (
            <div className="panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={15} className="text-cyan-400" />
                <h3 className="font-display font-semibold text-mist-100 text-sm">Lower PQC Concern</h3>
              </div>
              <div className="space-y-2">
                {data.lowerPqcConcern.map((algo) => (
                  <div key={algo} className="flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                    <span className="text-sm text-mist-100 font-mono">{algo}</span>
                    <span className="text-[10px] uppercase text-cyan-400 font-mono">Monitor</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {data.pqcMigrationTable && data.pqcMigrationTable.length > 0 && (
        <div className="panel overflow-hidden">
          <div className="px-5 py-4 border-b border-line-800">
            <h3 className="font-display font-semibold text-mist-100">Migration Priority</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-line-800">
                  {["System", "Current Crypto", "Priority", "Status", "PQC Direction"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 label-eyebrow">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.pqcMigrationTable.map((row) => (
                  <tr key={row.system} className="border-b border-line-800 last:border-0 hover:bg-ink-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-mist-100">{row.system}</td>
                    <td className="px-5 py-3.5 text-mist-300 font-mono text-xs">{row.current}</td>
                    <td className="px-5 py-3.5 text-mist-300">{row.priority}</td>
                    <td className="px-5 py-3.5 text-mist-500">{row.status}</td>
                    <td className="px-5 py-3.5 text-mist-300 text-xs max-w-xs">{row.direction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
