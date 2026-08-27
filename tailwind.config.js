/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070a",
          900: "#0a0e14",
          850: "#0d121a",
          800: "#111826",
          700: "#182233",
          600: "#233047",
          500: "#334361",
        },
        line: {
          800: "#1c2635",
          700: "#28354a",
          600: "#374863",
        },
        cyan: {
          400: "#5eead4",
          500: "#2dd4bf",
          600: "#14b8a6",
        },
        signal: {
          amber: "#e8a13c",
          rose: "#e5586b",
          violet: "#9d7bf0",
        },
        mist: {
          100: "#eef2f7",
          300: "#aab6c8",
          500: "#71809a",
          700: "#4a5670",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
        glow: "0 0 0 1px rgba(45,212,191,0.15), 0 0 24px -4px rgba(45,212,191,0.25)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.35 },
        },
      },
      animation: {
        scanline: "scanline 2.4s linear infinite",
        pulseDot: "pulseDot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
