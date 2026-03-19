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
        bg:      { DEFAULT: "#0B0B0B", 1: "#111111", 2: "#161616", 3: "#1E1E1E" },
        t:       { 1: "#FFFFFF", 2: "#888888", 3: "#444444", 4: "#2A2A2A" },
        orange:  { DEFAULT: "#F97316", light: "#FB923C" },
        line:    "rgba(255,255,255,0.07)",
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        sans:    ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
