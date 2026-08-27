import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { askAssistant } from "../services/api";
import { aiSuggestedQuestions } from "../data/mockData";

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi, I'm the ECDAT AI Assistant. Ask me anything about your organization's cryptographic inventory, risk findings, or PQC readiness.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    const answer = await askAssistant(q);
    setTyping(false);
    setMessages((m) => [...m, { role: "ai", text: answer }]);
  };

  return (
    <Layout title="AI Assistant" subtitle="Ask questions about your organization's cryptographic inventory and risk.">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-mist-100">ECDAT AI Assistant</h2>
        <p className="text-mist-500 text-sm mt-1">Ask questions about your organization's cryptographic inventory and risk.</p>
      </div>

      <div className="panel flex flex-col h-[600px] max-w-3xl">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-ink-700" : "bg-gradient-to-br from-cyan-500 to-signal-violet"
                }`}
              >
                {m.role === "user" ? <User size={15} className="text-mist-100" /> : <Bot size={15} className="text-ink-950" />}
              </div>
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-cyan-500 text-ink-950 rounded-tr-sm"
                    : "bg-ink-800 text-mist-100 border border-line-800 rounded-tl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-signal-violet flex items-center justify-center shrink-0">
                <Bot size={15} className="text-ink-950" />
              </div>
              <div className="bg-ink-800 border border-line-800 rounded-xl rounded-tl-sm px-4 py-3.5 flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-mist-500 animate-pulseDot" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-mist-500 animate-pulseDot" style={{ animationDelay: "200ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-mist-500 animate-pulseDot" style={{ animationDelay: "400ms" }} />
              </div>
            </div>
          )}
        </div>

        {messages.length < 3 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {aiSuggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-ink-800 border border-line-700 text-mist-300 hover:border-cyan-500/40 hover:text-cyan-400 transition-colors"
              >
                <Sparkles size={11} /> {q}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-line-800 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your cryptographic inventory..."
            className="flex-1 bg-ink-900 border border-line-800 rounded-lg px-4 py-2.5 text-sm text-mist-100 placeholder:text-mist-500 outline-none focus:border-cyan-500/40 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-lg bg-cyan-500 text-ink-950 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Layout>
  );
}
