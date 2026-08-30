import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileSearch, Layers, ShieldAlert, Atom, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import UploadBox from "../components/UploadBox";
import ScanProgress from "../components/ScanProgress";
import Button from "../components/Button";
import { uploadScan, startScan } from "../services/api";

const STAGES = [
  "Uploading project",
  "Extracting files",
  "Analyzing source code",
  "Detecting cryptographic APIs",
  "Building CBOM",
  "Calculating risk",
  "PQC analysis",
];

export default function ScanProject() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [stageIndex, setStageIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = (f) => {
    setFile(f);
    setUploadProgress(0);
    setResult(null);
    setError(null);
  };

  const handleRemove = () => {
    setFile(null);
    setUploadProgress(0);
    setResult(null);
    setStageIndex(-1);
    setError(null);
  };

  const performScan = async () => {
    if (!file) return;
    
    try {
      setScanning(true);
      setError(null);
      setStageIndex(0);
      
      // Upload file
      setStageIndex(0);
      const uploadResponse = await uploadScan(file);
      const scanId = uploadResponse.scan_id;
      setUploadProgress(100);
      
      // Start scanning
      setStageIndex(1);
      const scanResponse = await startScan(scanId);
      setStageIndex(6);
      
      // Show results
      setResult({
        scanId,
        filesScanned: scanResponse.files_scanned || 0,
        artifactsFound: scanResponse.artifacts_found || 0,
        highRiskFindings: 0, // Will be calculated from inventory
        pqcCandidates: 0, // Will be calculated from inventory
      });
      setScanning(false);
    } catch (err) {
      setError(err.message || "Scan failed. Please try again.");
      setScanning(false);
      setStageIndex(-1);
    }
  };

  return (
    <Layout title="Scan Project" subtitle="Upload a source-code project to discover cryptographic artifacts.">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-mist-100">Scan New Project</h2>
        <p className="text-mist-500 text-sm mt-1">Upload a source-code project to discover cryptographic artifacts.</p>
      </div>

      <div className="max-w-2xl">
        {error && (
          <div className="mb-5 p-4 rounded-lg bg-signal-rose/10 border border-signal-rose/20">
            <p className="text-sm text-signal-rose">{error}</p>
          </div>
        )}

        <UploadBox file={file} onFile={handleFile} onRemove={handleRemove} progress={uploadProgress} />

        {file && uploadProgress === 0 && !scanning && !result && (
          <div className="mt-5 flex justify-end">
            <Button onClick={performScan}>
              <FileSearch size={16} /> Start Cryptographic Scan
            </Button>
          </div>
        )}

        {(scanning || (stageIndex >= 0 && !result)) && (
          <div className="mt-5">
            <ScanProgress stages={STAGES} currentIndex={stageIndex} done={false} />
          </div>
        )}

        {result && (
          <div className="mt-5 space-y-5">
            <div className="panel p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <CheckCircle2 size={20} className="text-cyan-400" />
                <h3 className="font-display font-semibold text-mist-100 text-lg">Scan Complete</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat icon={FileSearch} label="Files Scanned" value={result.filesScanned.toLocaleString()} />
                <MiniStat icon={Layers} label="Crypto Artifacts" value={result.artifactsFound} />
                <MiniStat icon={ShieldAlert} label="High-Risk Findings" value={result.highRiskFindings} accent="rose" />
                <MiniStat icon={Atom} label="PQC Candidates" value={result.pqcCandidates} accent="amber" />
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => navigate("/inventory")}>
                  View Scan Results <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function MiniStat({ icon: Icon, label, value, accent = "cyan" }) {
  const accentMap = {
    cyan: "text-cyan-400 bg-cyan-500/10",
    rose: "text-signal-rose bg-signal-rose/10",
    amber: "text-signal-amber bg-signal-amber/10",
  };
  return (
    <div className="bg-ink-800/60 border border-line-800 rounded-lg p-4">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center mb-3 ${accentMap[accent]}`}>
        <Icon size={14} />
      </div>
      <div className="text-xl font-display font-semibold text-mist-100">{value}</div>
      <div className="text-[11px] text-mist-500 mt-0.5">{label}</div>
    </div>
  );
}
