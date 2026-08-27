import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-ink-950">
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r border-line-800 bg-ink-900/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-faint bg-[size:32px_32px] opacity-40" />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-signal-violet flex items-center justify-center">
            <ShieldCheck size={18} className="text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-mist-100 text-lg tracking-wide">ECDAT</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-semibold text-mist-100 leading-tight">
            Enterprise Cryptographic<br />Discovery &amp; Analysis
          </h1>
          <p className="text-mist-400 mt-5 leading-relaxed">
            Discover cryptographic assets. Understand security risk. Prepare for the post-quantum era.
          </p>
          <div className="flex items-center gap-2 mt-8">
            {["Discover", "Inventory", "Analyze", "Assess Risk", "PQC Ready"].map((s, i, arr) => (
              <div key={s} className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">{s}</span>
                {i < arr.length - 1 && <ArrowRight size={12} className="text-mist-700" />}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-mist-600 font-mono">© 2026 ECDAT Security. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-signal-violet flex items-center justify-center">
              <ShieldCheck size={18} className="text-ink-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-mist-100 text-lg">ECDAT</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-mist-100 mb-1.5">Sign in</h2>
          <p className="text-mist-500 text-sm mb-8">Access your cryptographic security workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-mist-400 mb-1.5 block">Email</label>
              <div className="flex items-center gap-2 bg-ink-900 border border-line-800 rounded-lg px-3.5 py-2.5 focus-within:border-cyan-500/40 transition-colors">
                <Mail size={15} className="text-mist-500" />
                <input
                  type="email"
                  required
                  defaultValue="aditi.rao@acme.com"
                  className="bg-transparent text-sm text-mist-100 outline-none w-full"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-mist-400 mb-1.5 block">Password</label>
              <div className="flex items-center gap-2 bg-ink-900 border border-line-800 rounded-lg px-3.5 py-2.5 focus-within:border-cyan-500/40 transition-colors">
                <Lock size={15} className="text-mist-500" />
                <input
                  type="password"
                  required
                  defaultValue="••••••••••"
                  className="bg-transparent text-sm text-mist-100 outline-none w-full"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-ink-950 font-medium rounded-lg py-2.5 text-sm hover:bg-cyan-400 transition-colors focus-ring mt-2"
            >
              Sign In <ArrowRight size={15} />
            </button>
          </form>

          <p className="text-xs text-mist-600 text-center mt-8">Demo build — sign-in proceeds directly to the dashboard.</p>
        </div>
      </div>
    </div>
  );
}
