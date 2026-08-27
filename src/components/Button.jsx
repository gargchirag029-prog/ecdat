export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium px-4 py-2.5 transition-colors duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-cyan-500 text-ink-950 hover:bg-cyan-400",
    secondary: "bg-ink-800 text-mist-100 border border-line-700 hover:bg-ink-700",
    ghost: "text-mist-300 hover:text-mist-100 hover:bg-ink-800",
    danger: "bg-signal-rose/10 text-signal-rose border border-signal-rose/30 hover:bg-signal-rose/20",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
