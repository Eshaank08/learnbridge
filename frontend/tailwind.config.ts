import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Node state tokens — used by SkillNode and legend components
        node: {
          // unlit: neutral slate — topic exists but hasn't been opened
          unlit: {
            DEFAULT: "#64748b", // slate-500
            bg: "#1e293b",      // slate-800
            border: "#475569",  // slate-600
            text: "#cbd5e1",    // slate-300
          },
          // lit: amber glow — topic opened, test not yet passed
          lit: {
            DEFAULT: "#f59e0b", // amber-500
            bg: "#451a03",      // amber-950
            border: "#d97706",  // amber-600
            text: "#fde68a",    // amber-200
            glow: "#f59e0b80",  // amber-500 / 50% — box-shadow color
          },
          // mastered: emerald — topic test passed
          mastered: {
            DEFAULT: "#10b981", // emerald-500
            bg: "#022c22",      // emerald-950
            border: "#059669",  // emerald-600
            text: "#a7f3d0",    // emerald-200
          },
          // locked: dimmed slate — prerequisites not yet mastered
          locked: {
            DEFAULT: "#334155", // slate-700
            bg: "#0f172a",      // slate-900
            border: "#1e293b",  // slate-800
            text: "#475569",    // slate-600
          },
        },
      },
      boxShadow: {
        // Glow effect used for lit nodes
        "node-lit": "0 0 12px 2px #f59e0b80",
      },
    },
  },
  plugins: [],
};
export default config;
