import { useEffect, useState } from "react";
import { ScanSearch, Layers, ShieldAlert, Atom, Gauge, ArrowRight, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import AlgorithmChart from "../components/AlgorithmChart";
import RiskChart from "../components/RiskChart";
import RiskBadge from "../components/RiskBadge";
import PriorityBadge from "../components/PriorityBadge";
import {
  getDashboardStats,
  getAlgorithmDistribution,
  getRiskDistribution,
  getSystems,
  getRecentScans,
  getCurrentScanId,
} from "../services/api";

const FLOW = ["Discover", "Inventory", "Analyze", "Assess Risk", "PQC Readiness", "Migration Priority"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [algoData, setAlgoData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [systems, setSystems] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const scanId = getCurrentScanId();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [s, algo, risk, sys, recent] = await Promise.all([
          getDashboardStats(scanId),
          getAlgorithmDistribution(scanId),
          getRiskDistribution(scanId),
          getSystems(scanId),
          getRecentScans(scanId),
        ]);
        setStats(s);
        setAlgoData(algo);
        setRiskData(risk);
        setSystems(sys);
        setScans(recent);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (scanId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [scanId]);

  return (
    <Layout title="Dashboard" subtitle="Cryptographic Security Overview">
      {!stats ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="text-center">
            <Upload size={48} className="mx-auto mb-4 text-mist-400" />
            <h2 className="font-display text-2xl font-semibold text-mist-100 mb-2">No Scan Data Available</h2>
            <p className="text-mist-500 mb-6 max-w-md">
              Get started by uploading a project zip file to scan for cryptographic artifacts and assess post-quantum readiness.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-ink-950 font-semibold rounded-lg transition-colors"
            >
              <Upload size={16} />
              Scan Project
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-mist-100">Cryptographic Security Overview</h2>
            <p className="text-mist-500 text-sm mt-1">
              Monitor cryptographic assets, security risks, and post-quantum readiness.
            </p>
          </div>

          {/* Flow strip */}
          <div className="panel px-5 py-4 mb-6 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {FLOW.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-800 border border-line-700">
                    <span className="text-[10px] font-mono text-cyan-400">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-xs text-mist-300 whitespace-nowrap">{step}</span>
                  </div>
                  {i < FLOW.length - 1 && <ArrowRight size={13} className="text-mist-700 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={ScanSearch} label="Assets Scanned" value={stats.assetsScanned.toLocaleString()} accent="cyan" />
            <StatCard icon={Layers} label="Crypto Artifacts" value={stats.cryptoArtifacts} accent="violet" />
            <StatCard icon={ShieldAlert} label="High Risk" value={stats.highRisk} accent="rose" />
            <StatCard icon={Atom} label="PQC Candidates" value={stats.pqcCandidates} accent="amber" />
            <StatCard icon={Gauge} label="PQC Readiness" value={stats.pqcReadiness} suffix="%" accent="cyan" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <div className="panel p-5">
              <h3 className="font-display font-semibold text-mist-100 mb-1">Cryptographic Algorithm Distribution</h3>
              <p className="text-xs text-mist-500 mb-2">Artifact count by algorithm family</p>
              <AlgorithmChart data={algoData} />
            </div>
            <div className="panel p-5">
              <h3 className="font-display font-semibold text-mist-100 mb-1">Risk Distribution</h3>
              <p className="text-xs text-mist-500 mb-2">Findings by severity</p>
              <RiskChart data={riskData} />
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 panel p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-mist-100">Top Migration Priorities</h3>
                <Link to="/pqc" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-1">
                {systems.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-line-800 last:border-0">
                    <div className="min-w-0">
                      <div className="text-sm text-mist-100 truncate">{s.name}</div>
                      <div className="text-xs text-mist-500 font-mono">{s.algorithm}</div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <RiskBadge level={s.risk} />
                      <PriorityBadge level={s.priority} />
                      <span className="text-xs text-mist-500 hidden sm:inline w-20 text-right">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 panel p-5">
              <h3 className="font-display font-semibold text-mist-100 mb-4">Recent Scans</h3>
              <div className="space-y-3">
                {scans.map((scan) => (
                  <div key={scan.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm text-mist-100 truncate font-mono">{scan.project}</div>
                      <div className="text-xs text-mist-500">{scan.date}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-cyan-400">{scan.artifactsFound} found</div>
                      <div className="text-[11px] text-mist-500">{scan.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
