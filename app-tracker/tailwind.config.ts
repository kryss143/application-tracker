import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          950: "#0a0a0f",
          900: "#111118",
          800: "#1a1a24",
          700: "#252532",
          600: "#32324a",
          500: "#4a4a6a",
          400: "#6b6b8a",
          300: "#9090aa",
          200: "#b8b8cc",
          100: "#e0e0ea",
          50: "#f4f4f8",
        },
        gold: {
          600: "#b8860b",
          500: "#d4a017",
          400: "#f0b429",
          300: "#f5c842",
          200: "#fad96a",
          100: "#fde9a0",
        },
        status: {
          wishlist: "#64748b",
          applied: "#3b82f6",
          interview: "#f59e0b",
          offer: "#10b981",
          rejected: "#ef4444",
        },
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(at 40% 20%, hsla(240,100%,74%,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.05) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.04) 0px, transparent 50%)",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(240,180,41,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
