import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { X, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ScanLine, Database, ShieldAlert, Atom, Bot, FileText, Settings as SettingsIcon,
} from "lucide-react";

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

export default function Layout({ title, subtitle, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-ink-950/80" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-ink-900 border-r border-line-800 h-full p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-signal-violet flex items-center justify-center">
                  <ShieldCheck size={15} className="text-ink-950" />
                </div>
                <span className="font-display font-semibold text-mist-100 text-sm">CRYPT AI</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-mist-400"><X size={18} /></button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                      isActive ? "bg-cyan-500/10 text-cyan-400" : "text-mist-300"
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar title={title} subtitle={subtitle} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-5 md:px-8 py-6 md:py-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
