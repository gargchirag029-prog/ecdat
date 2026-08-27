import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import RiskBadge from "./RiskBadge";

const PAGE_SIZE = 5;
const COLUMNS = [
  { key: "algorithm", label: "Algorithm" },
  { key: "keySize", label: "Version / Key Size" },
  { key: "file", label: "File" },
  { key: "line", label: "Line" },
  { key: "library", label: "Library" },
  { key: "purpose", label: "Purpose" },
  { key: "risk", label: "Risk" },
  { key: "quantumStatus", label: "PQC Status" },
];

export default function CryptoTable({ data }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (data.length === 0) {
    return (
      <div className="panel p-12 text-center">
        <p className="text-mist-300">No cryptographic artifacts match your filters.</p>
        <p className="text-mist-500 text-sm mt-1">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-line-800">
              {COLUMNS.map((col) => (
                <th key={col.key} className="text-left px-5 py-3">
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1.5 label-eyebrow hover:text-mist-300 transition-colors"
                  >
                    {col.label}
                    <ArrowUpDown size={11} className={sortKey === col.key ? "text-cyan-400" : "text-mist-700"} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr
                key={row.id}
                onClick={() => navigate(`/inventory/${row.id}`)}
                className="border-b border-line-800 last:border-0 hover:bg-ink-800/50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3.5 text-mist-100 font-medium">{row.algorithm}</td>
                <td className="px-5 py-3.5 text-mist-300 font-mono text-xs">{row.keySize}</td>
                <td className="px-5 py-3.5 text-mist-300 font-mono text-xs">{row.file}</td>
                <td className="px-5 py-3.5 text-mist-500 font-mono text-xs">{row.line}</td>
                <td className="px-5 py-3.5 text-mist-300">{row.library}</td>
                <td className="px-5 py-3.5 text-mist-300">{row.purpose}</td>
                <td className="px-5 py-3.5"><RiskBadge level={row.risk} /></td>
                <td className="px-5 py-3.5 text-mist-300 text-xs">{row.quantumStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3.5 border-t border-line-800">
        <span className="text-xs text-mist-500 font-mono">
          {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-mist-300 hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed focus-ring"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-mist-300 font-mono px-2">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-mist-300 hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed focus-ring"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
