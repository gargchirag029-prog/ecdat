const PRIORITY_STYLES = {
  Critical: "text-signal-rose",
  High: "text-signal-amber",
  Medium: "text-signal-violet",
  Low: "text-cyan-400",
};

export default function PriorityBadge({ level }) {
  const cls = PRIORITY_STYLES[level] || "text-mist-300";
  return <span className={`text-sm font-medium ${cls}`}>{level}</span>;
}
