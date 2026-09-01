import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, TriangleAlert } from "lucide-react";
import { analyzeEncryptionMethod } from "../services/api";

const OPTIONS = [
  { value: "AES-GCM", label: "AES-GCM", status: "Recommended", tag: "recommended", group: "Recommended", description: "Modern authenticated encryption" },
  { value: "AES-256-CBC", label: "AES-256-CBC", status: "Legacy compatibility", tag: "legacy", group: "Legacy compatibility", description: "Legacy cipher mode with compatibility tradeoffs" },
  { value: "3DES", label: "3DES", status: "Legacy compatibility", tag: "legacy", group: "Legacy compatibility", description: "Deprecated symmetric cipher" },
];

const statusStyles = {
  recommended: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  legacy: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
};

export default function EncryptionMethodSelector() {
  const [selected, setSelected] = useState("AES-GCM");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await analyzeEncryptionMethod(selected);
        setAnalysis(result);
      } catch (err) {
        setError(err.message || "Unable to analyze encryption method.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selected]);

  const selectedOption = useMemo(() => OPTIONS.find((o) => o.value === selected) || OPTIONS[0], [selected]);

  const statusMeta =
    analysis?.status === "recommended"
      ? { color: "text-emerald-300", icon: ShieldCheck }
      : analysis?.status === "legacy"
        ? { color: "text-amber-300", icon: TriangleAlert }
        : { color: "text-signal-rose", icon: ShieldAlert };

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="label-eyebrow">Encryption analysis</div>
          <h3 className="font-display font-semibold text-mist-100 text-lg">Encryption Method</h3>
        </div>
        <div className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-300">
          live
        </div>
      </div>

      <label className="block text-sm text-mist-300 mb-2">Choose an encryption method</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-xl border border-line-700 bg-ink-900 text-mist-100 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="mt-4 space-y-2">
        {OPTIONS.map((option) => {
          const active = option.value === selected;
          return (
            <div
              key={option.value}
              className={`rounded-xl border p-3 transition-colors ${active ? "border-cyan-500/40 bg-cyan-500/5" : "border-line-800 bg-ink-900/40"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-mist-100">{option.label}</div>
                  <div className="text-[11px] text-mist-500">{option.description}</div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${statusStyles[option.tag]}`}>
                  {option.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-line-800 bg-ink-900/50 p-4">
        {loading && <div className="text-sm text-mist-400">Analyzing selected method…</div>}
        {error && <div className="text-sm text-signal-rose">{error}</div>}
        {analysis && !loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-mist-500">Selected</div>
                <div className="text-lg font-display font-semibold text-mist-100">{analysis.algorithm}</div>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[analysis.status === "recommended" ? "recommended" : analysis.status === "legacy" ? "legacy" : "legacy"]}`}>
                {statusMeta && <statusMeta.icon size={12} />}
                <span className="capitalize">{analysis.status}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <InfoRow label="Type" value={analysis.type} />
              <InfoRow label="Security" value={analysis.security_level} />
              <InfoRow label="PQC" value={analysis.pqc_status} />
              <InfoRow label="Risk score" value={analysis.risk_score} />
            </div>

            <div className="rounded-lg border border-line-800 bg-ink-800/60 p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-mist-500 mb-1">Recommendation</div>
              <div className="text-sm text-mist-200">{analysis.recommendation}</div>
            </div>

            <div className="mt-2">
              <div className="text-[11px] uppercase tracking-[0.18em] text-mist-500 mb-2">Risk score visualization</div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-800">
                <div
                  className={`h-full rounded-full ${analysis.risk_score >= 70 ? "bg-signal-rose" : analysis.risk_score >= 35 ? "bg-signal-amber" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(analysis.risk_score, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-[11px] text-mist-500">
        Selected method: <span className="font-mono text-cyan-300">{selectedOption.label}</span>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-lg border border-line-800 bg-ink-800/40 p-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-mist-500">{label}</div>
      <div className="mt-1 text-sm text-mist-100">{value}</div>
    </div>
  );
}
