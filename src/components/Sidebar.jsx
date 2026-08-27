import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  Database,
  ShieldAlert,
  Atom,
  Bot,
  FileText,
  Settings as SettingsIcon,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/scan", label: "Scan Project", icon: ScanLine },
  { to: "/inventory", label: "Crypto Inventory", icon: Database },
  { to: "/risks", label: "Risk Analysis", icon: ShieldAlert },
  { to: "/pqc", label: "PQC Readiness", icon: Atom },
  { to: "/ai", label: "AI Assistant", icon: Bot },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-line-800 bg-ink-950/80 backdrop-blur-sm transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-line-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-signal-violet flex items-center justify-center shrink-0">
          <ShieldCheck size={17} className="text-ink-950" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="leading-tight overflow-hidden">
            <div className="font-display font-semibold text-mist-100 text-sm tracking-wide">ECDAT</div>
            <div className="text-[10px] text-mist-500 font-mono truncate">Crypto Discovery</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 focus-ring ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-mist-300 border border-transparent hover:bg-ink-800 hover:text-mist-100"
              }`
            }
          >
            <Icon size={17} strokeWidth={1.8} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line-800 p-3 space-y-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-ink-900/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulseDot absolute inline-flex h-full w-full rounded-full bg-cyan-400" />
            </span>
            <div className="text-xs text-mist-300 leading-tight">
              <div className="font-medium">Scanner Online</div>
              <div className="text-mist-500 font-mono text-[10px]">v2.4.1 · 4 engines active</div>
            </div>
          </div>
        )}
        <div className={`flex items-center gap-2.5 px-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-ink-700 border border-line-700 flex items-center justify-center text-xs font-medium text-mist-100 shrink-0">
            AR
          </div>
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <div className="text-sm text-mist-100 truncate">Aditi Rao</div>
              <div className="text-[11px] text-mist-500 truncate">Security Engineer</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center gap-2 text-mist-500 hover:text-mist-100 text-xs py-1.5 rounded-lg hover:bg-ink-800 transition-colors focus-ring"
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        </button>
      </div>
    </aside>
  );
}
