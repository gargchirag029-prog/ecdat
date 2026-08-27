export default function StatCard({ icon: Icon, label, value, suffix, accent = "cyan", trend }) {
  const accentMap = {
    cyan: "text-cyan-400 bg-cyan-500/10",
    rose: "text-signal-rose bg-signal-rose/10",
    amber: "text-signal-amber bg-signal-amber/10",
    violet: "text-signal-violet bg-signal-violet/10",
  };
  return (
    <div className="panel panel-hover p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="label-eyebrow">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-display font-semibold text-mist-100">{value}</span>
        {suffix && <span className="text-lg text-mist-500 font-display">{suffix}</span>}
      </div>
      {trend && <span className="text-xs text-mist-500">{trend}</span>}
    </div>
  );
}
