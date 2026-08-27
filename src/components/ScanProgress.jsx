import { CheckCircle2, Loader2, Circle } from "lucide-react";

export default function ScanProgress({ stages, currentIndex, done }) {
  const pct = done ? 100 : Math.round(((currentIndex + 1) / stages.length) * 100) || 0;

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="label-eyebrow">Cryptographic Scan Pipeline</span>
        <span className="text-sm font-mono text-cyan-400">{pct}%</span>
      </div>

      <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-signal-violet rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="space-y-3">
        {stages.map((stage, i) => {
          const complete = done || i < currentIndex;
          const active = !done && i === currentIndex;
          return (
            <li key={stage} className="flex items-center gap-3 text-sm">
              {complete ? (
                <CheckCircle2 size={17} className="text-cyan-400 shrink-0" />
              ) : active ? (
                <Loader2 size={17} className="text-signal-violet animate-spin shrink-0" />
              ) : (
                <Circle size={17} className="text-mist-700 shrink-0" />
              )}
              <span className={complete ? "text-mist-100" : active ? "text-mist-100" : "text-mist-500"}>
                Step {i + 1} — {stage}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
