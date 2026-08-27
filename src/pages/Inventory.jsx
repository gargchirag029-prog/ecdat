import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Layout from "../components/Layout";
import CryptoTable from "../components/CryptoTable";
import { getInventory } from "../services/api";

export default function Inventory() {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [algoFilter, setAlgoFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [appFilter, setAppFilter] = useState("All");

  useEffect(() => {
    getInventory().then((data) => {
      setArtifacts(data);
      setLoading(false);
    });
  }, []);

  const algorithms = useMemo(() => ["All", ...new Set(artifacts.map((a) => a.algorithm))], [artifacts]);
  const risks = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const apps = useMemo(() => ["All", ...new Set(artifacts.map((a) => a.application))], [artifacts]);

  const filtered = useMemo(() => {
    return artifacts.filter((a) => {
      const matchesQuery =
        !query ||
        a.algorithm.toLowerCase().includes(query.toLowerCase()) ||
        a.file.toLowerCase().includes(query.toLowerCase()) ||
        a.purpose.toLowerCase().includes(query.toLowerCase());
      const matchesAlgo = algoFilter === "All" || a.algorithm === algoFilter;
      const matchesRisk = riskFilter === "All" || a.risk === riskFilter;
      const matchesApp = appFilter === "All" || a.application === appFilter;
      return matchesQuery && matchesAlgo && matchesRisk && matchesApp;
    });
  }, [artifacts, query, algoFilter, riskFilter, appFilter]);

  return (
    <Layout title="Crypto Inventory" subtitle="All cryptographic artifacts discovered across scanned assets.">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-mist-100">Cryptographic Inventory</h2>
        <p className="text-mist-500 text-sm mt-1">All cryptographic artifacts discovered across scanned assets.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 bg-ink-900 border border-line-800 rounded-lg px-3 py-2.5 flex-1 focus-within:border-cyan-500/40">
          <Search size={15} className="text-mist-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search algorithm, file, or purpose..."
            className="bg-transparent text-sm text-mist-100 placeholder:text-mist-500 outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect icon={SlidersHorizontal} value={algoFilter} onChange={setAlgoFilter} options={algorithms} />
          <FilterSelect value={riskFilter} onChange={setRiskFilter} options={risks} />
          <FilterSelect value={appFilter} onChange={setAppFilter} options={apps} />
        </div>
      </div>

      {loading ? (
        <div className="panel h-96 animate-pulse" />
      ) : (
        <CryptoTable data={filtered} />
      )}
    </Layout>
  );
}

function FilterSelect({ icon: Icon, value, onChange, options }) {
  return (
    <div className="flex items-center gap-1.5 bg-ink-900 border border-line-800 rounded-lg px-3 py-2.5">
      {Icon && <Icon size={13} className="text-mist-500" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm text-mist-100 outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-ink-900">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
