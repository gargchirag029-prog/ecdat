import { useCallback, useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";

export default function UploadBox({ file, onFile, onRemove, progress }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  if (file) {
    return (
      <div className="panel p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
          <FileIcon size={20} className="text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-mist-100 truncate">{file.name}</span>
            <span className="text-xs text-mist-500 font-mono shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-ink-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-2 rounded-lg text-mist-500 hover:text-signal-rose hover:bg-signal-rose/10 transition-colors focus-ring shrink-0"
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed p-14 flex flex-col items-center justify-center text-center transition-colors duration-200 ${
        dragging ? "border-cyan-500/60 bg-cyan-500/5" : "border-line-700 bg-ink-900/40 hover:border-line-600"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip,.tar,.gz"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <div className="w-14 h-14 rounded-xl bg-ink-800 border border-line-700 flex items-center justify-center mb-4">
        <UploadCloud size={24} className="text-cyan-400" />
      </div>
      <p className="text-mist-100 font-medium">Drag &amp; drop your project here</p>
      <p className="text-mist-500 text-sm mt-1">
        or <span className="text-cyan-400 underline underline-offset-2">Browse Files</span>
      </p>
      <p className="text-mist-500 text-xs font-mono mt-4">Supports .ZIP, .TAR — source folders via CLI agent</p>
    </div>
  );
}
