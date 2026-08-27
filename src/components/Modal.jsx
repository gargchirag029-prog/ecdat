import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative panel w-full max-w-md p-6 animate-[fadeIn_0.15s_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-mist-100">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-mist-500 hover:text-mist-100 hover:bg-ink-800 focus-ring">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
