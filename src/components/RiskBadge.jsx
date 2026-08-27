const RISK_STYLES = {
  CRITICAL: "bg-signal-rose/10 text-signal-rose border-signal-rose/30",
  HIGH: "bg-signal-amber/10 text-signal-amber border-signal-amber/30",
  MEDIUM: "bg-signal-violet/10 text-signal-violet border-signal-violet/30",
  LOW: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
};

export default function RiskBadge({ level }) {
  const key = (level || "").toUpperCase();
  const cls = RISK_STYLES[key] || "bg-mist-500/10 text-mist-300 border-mist-500/30";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-mono uppercase tracking-wide ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}
