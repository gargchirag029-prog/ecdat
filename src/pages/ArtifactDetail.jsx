import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Bot, Link2, Layers, ShieldAlert, Atom } from "lucide-react";
import Layout from "../components/Layout";
import RiskBadge from "../components/RiskBadge";
import Button from "../components/Button";
import { getArtifact } from "../services/api";

export default function ArtifactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artifact, setArtifact] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getArtifact(id).then((a) => (a ? setArtifact(a) : setNotFound(true)));
  }, [id]);

  if (notFound) {
    return (
      <Layout title="Artifact Not Found">
        <div className="panel p-10 text-center">
          <p className="text-mist-300">This cryptographic artifact could not be found.</p>
          <Link to="/inventory" className="text-cyan-400 text-sm hover:underline mt-2 inline-block">
            Back to inventory
          </Link>
        </div>
      </Layout>
    );
  }

  if (!artifact) {
    return (
      <Layout title="Loading…">
        <div className="panel h-64 animate-pulse" />
      </Layout>
    );
  }

  return (
    <Layout title={`${artifact.algorithm}-${artifact.keySize}`} subtitle={artifact.file}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-mist-400 hover:text-mist-100 mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to inventory
      </button>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-mist-100">
            {artifact.algorithm}-{artifact.keySize}
          </h2>
          <p className="text-mist-500 text-sm mt-1">{artifact.purpose} · {artifact.application}</p>
        </div>
        <RiskBadge level={artifact.risk} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="panel p-6">
            <span className="label-eyebrow">Source Location</span>
            <div className="mt-3 rounded-lg bg-ink-950 border border-line-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-line-800 bg-ink-900/60">
                <span className="text-xs font-mono text-mist-400">{artifact.file}</span>
                <span className="text-xs font-mono text-mist-500">line {artifact.line}</span>
              </div>
              <pre className="px-4 py-3.5 text-sm font-mono overflow-x-auto">
                <code className="text-cyan-300">{artifact.snippet}</code>
              </pre>
            </div>
          </div>

          <Section title="Why is this risky?">
            <p className="text-sm text-mist-300 leading-relaxed">
              {artifact.risk === "CRITICAL" || artifact.risk === "HIGH"
                ? `${artifact.algorithm} relies on a mathematical hardness assumption that is vulnerable to sufficiently advanced quantum algorithms. Given its role in ${artifact.purpose.toLowerCase()} for ${artifact.application}, a compromise here has broad downstream impact and long remediation lead time.`
                : `${artifact.algorithm} is a symmetric or hash-based primitive. Its main exposure comes from key size and implementation hygiene rather than a known quantum break, so it is flagged for periodic review rather than immediate migration.`}
            </p>
          </Section>

          <Section title="Where is it used?">
            <ul className="space-y-2">
              {artifact.usedIn.map((loc) => (
                <li key={loc} className="flex items-center gap-2 text-sm text-mist-300 font-mono">
                  <Link2 size={13} className="text-mist-500" /> {loc}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Dependencies">
            <div className="flex flex-wrap gap-2">
              {artifact.dependencies.map((dep) => (
                <span key={dep} className="px-2.5 py-1 rounded-md bg-ink-800 border border-line-700 text-xs font-mono text-mist-300">
                  {dep}
                </span>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <div className="panel p-5">
            <span className="label-eyebrow">Details</span>
            <dl className="mt-3 space-y-3">
              <Detail label="Algorithm" value={artifact.algorithm} />
              <Detail label="Key Size" value={`${artifact.keySize} ${artifact.keySize !== "—" ? "bits" : ""}`} />
              <Detail label="File" value={artifact.file} mono />
              <Detail label="Line" value={artifact.line} mono />
              <Detail label="Library" value={artifact.library} />
              <Detail label="Purpose" value={artifact.purpose} />
              <Detail label="Quantum Status" value={artifact.quantumStatus} />
            </dl>
          </div>

          <div className="panel p-5">
            <span className="label-eyebrow flex items-center gap-1.5"><Layers size={11} /> Migration Priority</span>
            <p className="text-2xl font-display font-semibold text-mist-100 mt-2">{artifact.priority}</p>
            <p className="text-xs text-mist-500 mt-1">Based on risk level, exposure, and system criticality.</p>
          </div>

          <div className="panel p-5">
            <span className="label-eyebrow flex items-center gap-1.5"><Atom size={11} /> PQC Considerations</span>
            <p className="text-sm text-mist-300 mt-2 leading-relaxed">
              {["RSA", "ECDSA", "ECDH"].includes(artifact.algorithm)
                ? "Evaluate appropriate PQC mechanism based on use case — no universal drop-in replacement exists for every classical algorithm."
                : "Lower quantum concern. Monitor NIST guidance and revisit key sizing during your next scheduled review."}
            </p>
          </div>

          <Button className="w-full" onClick={() => navigate("/ai")}>
            <Bot size={16} /> Ask CRYPT AI
          </Button>
        </div>
      </div>
    </Layout>
  );
}

function Section({ title, children }) {
  return (
    <div className="panel p-6">
      <h3 className="font-display font-semibold text-mist-100 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs text-mist-500">{label}</dt>
      <dd className={`text-sm text-mist-100 text-right ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
