import { Search, Bell, Menu } from "lucide-react";

export default function Navbar({ title, subtitle, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between gap-4 px-5 md:px-8 border-b border-line-800 bg-ink-950/85 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-mist-300 hover:bg-ink-800 focus-ring"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display font-semibold text-mist-100 text-base leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-mist-500 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 bg-ink-900 border border-line-800 rounded-lg px-3 py-1.5 w-64 focus-within:border-cyan-500/40 transition-colors">
          <Search size={14} className="text-mist-500" />
          <input
            placeholder="Search assets, CVEs, systems..."
            className="bg-transparent text-sm text-mist-100 placeholder:text-mist-500 outline-none w-full"
          />
        </div>
        <button className="relative p-2 rounded-lg text-mist-300 hover:bg-ink-800 hover:text-mist-100 transition-colors focus-ring">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-signal-rose" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-signal-violet flex items-center justify-center text-[11px] font-semibold text-ink-950">
          AR
        </div>
      </div>
    </header>
  );
}
