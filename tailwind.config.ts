import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "ink-indigo": "var(--ink-indigo)",
        "dusk-teal": "var(--dusk-teal)",
        "marigold": "var(--marigold)",
        "sand": "var(--sand)",
        "clay-rose": "var(--clay-rose)",
        "deep-charcoal": "var(--deep-charcoal)",
      },
      boxShadow: {
        theme: "var(--shadow-theme-val)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-fraunces)", "serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
