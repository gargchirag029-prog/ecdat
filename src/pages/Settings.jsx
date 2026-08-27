import { useState } from "react";
import { User, ScanLine, ShieldAlert, Atom, Bell, Settings as SettingsIcon } from "lucide-react";
import Layout from "../components/Layout";

const SECTIONS = [
  { id: "general", label: "General Settings", icon: SettingsIcon },
  { id: "scanning", label: "Scanning Settings", icon: ScanLine },
  { id: "risk", label: "Risk Settings", icon: ShieldAlert },
  { id: "pqc", label: "PQC Settings", icon: Atom },
  { id: "notifications", label: "Notification Settings", icon: Bell },
  { id: "profile", label: "User Profile", icon: User },
];

function Toggle({ defaultChecked }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`w-10 h-5.5 h-6 rounded-full transition-colors relative shrink-0 ${on ? "bg-cyan-500" : "bg-ink-700"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-ink-950 transition-transform ${on ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

function Row({ label, desc, control }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-line-800 last:border-0 gap-4">
      <div>
        <div className="text-sm text-mist-100">{label}</div>
        {desc && <div className="text-xs text-mist-500 mt-0.5">{desc}</div>}
      </div>
      {control}
    </div>
  );
}

export default function Settings() {
  const [active, setActive] = useState("general");

  return (
    <Layout title="Settings" subtitle="Configure your ECDAT workspace.">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-mist-100">Settings</h2>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="panel p-2 h-fit">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                active === id ? "bg-cyan-500/10 text-cyan-400" : "text-mist-300 hover:bg-ink-800"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 panel p-6">
          {active === "general" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">General Settings</h3>
              <Row label="Organization name" desc="Displayed across reports and the dashboard" control={<input defaultValue="Acme Corp" className="bg-ink-900 border border-line-800 rounded-lg px-3 py-1.5 text-sm text-mist-100 outline-none w-48" />} />
              <Row label="Time zone" desc="Used for scan scheduling and timestamps" control={<span className="text-sm text-mist-300 font-mono">UTC+05:30</span>} />
              <Row label="Dark interface" desc="ECDAT is optimized for dark mode" control={<Toggle defaultChecked />} />
            </div>
          )}
          {active === "scanning" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">Scanning Settings</h3>
              <Row label="Auto-scan on commit" desc="Trigger a scan on every push to main" control={<Toggle />} />
              <Row label="Deep dependency analysis" desc="Scan transitive dependencies for crypto usage" control={<Toggle defaultChecked />} />
              <Row label="Max file size" desc="Skip files larger than this during scanning" control={<span className="text-sm text-mist-300 font-mono">50 MB</span>} />
            </div>
          )}
          {active === "risk" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">Risk Settings</h3>
              <Row label="Critical risk threshold" desc="Impact × likelihood score treated as critical" control={<span className="text-sm text-mist-300 font-mono">≥ 16</span>} />
              <Row label="Auto-escalate critical findings" desc="Notify security lead immediately" control={<Toggle defaultChecked />} />
            </div>
          )}
          {active === "pqc" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">PQC Settings</h3>
              <Row label="Track NIST PQC standards" desc="Auto-update guidance as standards evolve" control={<Toggle defaultChecked />} />
              <Row label="Flag ECC for review" desc="Include ECC family algorithms in readiness scoring" control={<Toggle defaultChecked />} />
            </div>
          )}
          {active === "notifications" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">Notification Settings</h3>
              <Row label="Email digests" desc="Weekly summary of new findings" control={<Toggle defaultChecked />} />
              <Row label="Slack alerts" desc="Post critical findings to #security-alerts" control={<Toggle />} />
            </div>
          )}
          {active === "profile" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">User Profile</h3>
              <Row label="Name" control={<span className="text-sm text-mist-300">Aditi Rao</span>} />
              <Row label="Role" control={<span className="text-sm text-mist-300">Security Engineer</span>} />
              <Row label="Email" control={<span className="text-sm text-mist-300 font-mono">aditi.rao@acme.com</span>} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
