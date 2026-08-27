import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import RiskBadge from "../components/RiskBadge";
import { getRiskAnalysis } from "../services/api";

const IMPACT_LEVELS = [5, 4, 3, 2, 1];
const LIKELIHOOD_LEVELS = [1, 2, 3, 4, 5];

function cellColor(impact, likelihood) {
  const score = impact * likelihood;
  if (score >= 16) return "bg-signal-rose/25 border-signal-rose/40";
  if (score >= 9) return "bg-signal-amber/20 border-signal-amber/35";
  if (score >= 4) return "bg-signal-violet/15 border-signal-violet/30";
  return "bg-cyan-500/10 border-cyan-500/20";
}

export default function RiskAnalysis() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    getRiskAnalysis().then(setData);
  }, []);

  if (!data) {
    return (
      <Layout title="Risk Analysis">
        <div className="panel h-96 animate-pulse" />
      </Layout>
    );
  }

  const { riskFindings, riskSummary } = data;

  return (
    <Layout title="Risk Analysis" subtitle="Cryptographic Risk Analysis">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-mist-100">Cryptographic Risk Analysis</h2>
        <p className="text-mist-500 text-sm mt-1">Organization-wide risk posture derived from your crypto inventory.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Critical" value={riskSummary.critical} color="text-signal-rose" bar="bg-signal-rose" />
        <SummaryCard label="High" value={riskSummary.high} color="text-signal-amber" bar="bg-signal-amber" />
        <SummaryCard label="Medium" value={riskSummary.medium} color="text-signal-violet" bar="bg-signal-violet" />
        <SummaryCard label="Low" value={riskSummary.low} color="text-cyan-400" bar="bg-cyan-500" />
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 panel p-5">
          <h3 className="font-display font-semibold text-mist-100 mb-1">Risk Matrix</h3>
          <p className="text-xs text-mist-500 mb-4">Impact vs. likelihood across active findings</p>
          <div className="flex gap-2">
            <div className="flex flex-col justify-between text-[10px] font-mono text-mist-500 py-1">
              {IMPACT_LEVELS.map((v) => <span key={v} className="h-9 flex items-center">{v}</span>)}
            </div>
            <div className="flex-1">
              <div className="grid grid-rows-5 gap-1">
                {IMPACT_LEVELS.map((impact) => (
                  <div key={impact} className="grid grid-cols-5 gap-1">
                    {LIKELIHOOD_LEVELS.map((likelihood) => {
                      const match = riskFindings.filter((f) => f.impact === impact && f.likelihood === likelihood);
                      return (
                        <div
                          key={likelihood}
                          className={`h-9 rounded-md border flex items-center justify-center text-[11px] font-mono text-mist-100 ${cellColor(impact, likelihood)}`}
                          title={match.map((m) => m.system).join(", ")}
                        >
                          {match.length > 0 ? match.length : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {LIKELIHOOD_LEVELS.map((v) => (
                  <span key={v} className="text-[10px] font-mono text-mist-500 text-center">{v}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-mist-500 font-mono">
            <span>Likelihood →</span>
            <span className="rotate-0">↑ Impact</span>
          </div>
        </div>

        <div className="lg:col-span-3 panel p-5">
          <h3 className="font-display font-semibold text-mist-100 mb-4">Highest Priority Findings</h3>
          <div className="space-y-1">
            {riskFindings.map((f) => (
              <div
                key={f.rank}
                onClick={() => navigate("/inventory")}
                className="flex items-center justify-between gap-3 py-3 border-b border-line-800 last:border-0 cursor-pointer hover:bg-ink-800/40 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-ink-800 border border-line-700 flex items-center justify-center text-xs font-mono text-mist-400 shrink-0">
                    {f.rank}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-mist-100 truncate">{f.system}</div>
                    <div className="text-xs text-mist-500 font-mono">{f.algorithm}</div>
                  </div>
                </div>
                <RiskBadge level={f.risk} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SummaryCard({ label, value, color, bar }) {
  return (
    <div className="panel p-5">
      <span className="label-eyebrow">{label}</span>
      <div className={`text-3xl font-display font-semibold mt-2 ${color}`}>{value}</div>
      <div className="h-1 rounded-full bg-ink-800 mt-3 overflow-hidden">
        <div className={`h-full ${bar} rounded-full`} style={{ width: `${Math.min(100, value * 3)}%` }} />
      </div>
    </div>
  );
}
