import { useEffect, useState } from "react";
import { FileText, Download, Eye, Loader2 } from "lucide-react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { getReports, generateReport } from "../services/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState({});
  const [ready, setReady] = useState({});

  useEffect(() => {
    getReports().then(setReports);
  }, []);

  const handleGenerate = async (id) => {
    setGenerating((g) => ({ ...g, [id]: true }));
    await generateReport(id);
    setGenerating((g) => ({ ...g, [id]: false }));
    setReady((r) => ({ ...r, [id]: true }));
  };

  return (
    <Layout title="Reports" subtitle="Generate and export cryptographic security reports.">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-mist-100">Reports</h2>
        <p className="text-mist-500 text-sm mt-1">Generate and export cryptographic security reports.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <div key={r.id} className="panel p-5 flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
              <FileText size={18} className="text-cyan-400" />
            </div>
            <h3 className="font-display font-semibold text-mist-100">{r.title}</h3>
            <p className="text-xs text-mist-500 mt-1.5 flex-1">{r.description}</p>

            {ready[r.id] && (
              <div className="text-[11px] text-cyan-400 font-mono mb-3 mt-4">✓ Report ready</div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                className="flex-1 !py-2 !text-xs"
                onClick={() => handleGenerate(r.id)}
                disabled={generating[r.id]}
              >
                {generating[r.id] ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                {generating[r.id] ? "Generating…" : "Generate Report"}
              </Button>
              <Button variant="ghost" className="!py-2 !px-2.5" disabled={!ready[r.id]} title="View">
                <Eye size={14} />
              </Button>
              <Button variant="ghost" className="!py-2 !px-2.5" disabled={!ready[r.id]} title="Export">
                <Download size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
