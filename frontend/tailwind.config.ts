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
        black:  { DEFAULT: "#0B0B0B", 2: "#111111", 3: "#161616" },
        surface: { DEFAULT: "#1C1C1C", 2: "#242424", 3: "#333333" },
        muted:  { DEFAULT: "#555555", 2: "#888888" },
        orange: { DEFAULT: "#FF6B00", light: "#FF8C00", dark: "#CC5500" },
        cyan:   { DEFAULT: "#00BFFF", dark: "#0090CC" },
        gold:   { DEFAULT: "#C9A84C", light: "#E2C07A" },
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body:    ["Space Grotesk", "sans-serif"],
        sans:    ["Inter", "sans-serif"],
      },
      animation: {
        "fade-up": "fade-up 0.6s ease forwards",
        "lightning": "lightning-pulse 2.5s ease-in-out infinite",
        "live-dot": "live-dot 1.4s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "lightning-pulse": {
          "0%,100%": { filter: "drop-shadow(0 0 6px rgba(255,107,0,0.6))" },
          "50%": { filter: "drop-shadow(0 0 18px rgba(255,107,0,1)) drop-shadow(0 0 35px rgba(255,107,0,0.4))" },
        },
        "live-dot": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
