import { useEffect, useState } from "react";
import { User, ScanLine, ShieldAlert, Atom, Bell, Settings as SettingsIcon } from "lucide-react";
import Layout from "../components/Layout";

const STORAGE_KEY = "cryptai-settings";

const DEFAULT_SETTINGS = {
  general: {
    organizationName: "Acme Corp",
    timeZone: "UTC+05:30",
    darkMode: true,
  },
  scanning: {
    autoScanOnCommit: false,
    deepDependencyAnalysis: true,
    maxFileSize: 50,
  },
  risk: {
    criticalRiskThreshold: 16,
    autoEscalateCritical: true,
  },
  pqc: {
    trackNistStandards: true,
    flagEccForReview: true,
  },
  notifications: {
    emailDigests: true,
    slackAlerts: false,
  },
  profile: {
    name: "Admin",
    role: "Administrator",
    email: "admin@cryptai.local",
  },
};

const SECTIONS = [
  { id: "general", label: "General Settings", icon: SettingsIcon },
  { id: "scanning", label: "Scanning Settings", icon: ScanLine },
  { id: "risk", label: "Risk Settings", icon: ShieldAlert },
  { id: "pqc", label: "PQC Settings", icon: Atom },
  { id: "notifications", label: "Notification Settings", icon: Bell },
  { id: "profile", label: "User Profile", icon: User },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      aria-label="Toggle setting"
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${checked ? "bg-cyan-500" : "bg-ink-700"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-ink-950 transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
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
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    document.body.classList.toggle("theme-light", !settings.general.darkMode);
    document.body.classList.toggle("theme-dark", settings.general.darkMode);
  }, [settings]);

  const updateSetting = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <Layout title="Settings" subtitle="Configure your CRYPT AI workspace.">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-mist-100">Settings</h2>
        <button
          type="button"
          onClick={resetSettings}
          className="text-xs px-3 py-1.5 rounded-md border border-line-800 text-mist-300 hover:bg-ink-800 transition-colors"
        >
          Reset defaults
        </button>
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
              <Row
                label="Organization name"
                desc="Displayed across reports and the dashboard"
                control={
                  <input
                    value={settings.general.organizationName}
                    onChange={(e) => updateSetting("general", "organizationName", e.target.value)}
                    className="bg-ink-900 border border-line-800 rounded-lg px-3 py-1.5 text-sm text-mist-100 outline-none w-48"
                  />
                }
              />
              <Row
                label="Time zone"
                desc="Used for scan scheduling and timestamps"
                control={<span className="text-sm text-mist-300 font-mono">{settings.general.timeZone}</span>}
              />
              <Row
                label="Dark interface"
                desc="CRYPT AI is optimized for dark mode"
                control={<Toggle checked={settings.general.darkMode} onChange={(value) => updateSetting("general", "darkMode", value)} />}
              />
            </div>
          )}
          {active === "scanning" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">Scanning Settings</h3>
              <Row
                label="Auto-scan on commit"
                desc="Trigger a scan on every push to main"
                control={<Toggle checked={settings.scanning.autoScanOnCommit} onChange={(value) => updateSetting("scanning", "autoScanOnCommit", value)} />}
              />
              <Row
                label="Deep dependency analysis"
                desc="Scan transitive dependencies for crypto usage"
                control={<Toggle checked={settings.scanning.deepDependencyAnalysis} onChange={(value) => updateSetting("scanning", "deepDependencyAnalysis", value)} />}
              />
              <Row
                label="Max file size"
                desc="Skip files larger than this during scanning"
                control={<span className="text-sm text-mist-300 font-mono">{settings.scanning.maxFileSize} MB</span>}
              />
            </div>
          )}
          {active === "risk" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">Risk Settings</h3>
              <Row
                label="Critical risk threshold"
                desc="Impact × likelihood score treated as critical"
                control={<span className="text-sm text-mist-300 font-mono">≥ {settings.risk.criticalRiskThreshold}</span>}
              />
              <Row
                label="Auto-escalate critical findings"
                desc="Notify security lead immediately"
                control={<Toggle checked={settings.risk.autoEscalateCritical} onChange={(value) => updateSetting("risk", "autoEscalateCritical", value)} />}
              />
            </div>
          )}
          {active === "pqc" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">PQC Settings</h3>
              <Row
                label="Track NIST PQC standards"
                desc="Auto-update guidance as standards evolve"
                control={<Toggle checked={settings.pqc.trackNistStandards} onChange={(value) => updateSetting("pqc", "trackNistStandards", value)} />}
              />
              <Row
                label="Flag ECC for review"
                desc="Include ECC family algorithms in readiness scoring"
                control={<Toggle checked={settings.pqc.flagEccForReview} onChange={(value) => updateSetting("pqc", "flagEccForReview", value)} />}
              />
            </div>
          )}
          {active === "notifications" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">Notification Settings</h3>
              <Row
                label="Email digests"
                desc="Weekly summary of new findings"
                control={<Toggle checked={settings.notifications.emailDigests} onChange={(value) => updateSetting("notifications", "emailDigests", value)} />}
              />
              <Row
                label="Slack alerts"
                desc="Post critical findings to #security-alerts"
                control={<Toggle checked={settings.notifications.slackAlerts} onChange={(value) => updateSetting("notifications", "slackAlerts", value)} />}
              />
            </div>
          )}
          {active === "profile" && (
            <div>
              <h3 className="font-display font-semibold text-mist-100 mb-4">User Profile</h3>
              <Row label="Name" control={<span className="text-sm text-mist-300">{settings.profile.name}</span>} />
              <Row label="Role" control={<span className="text-sm text-mist-300">{settings.profile.role}</span>} />
              <Row label="Email" control={<span className="text-sm text-mist-300 font-mono">{settings.profile.email}</span>} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
