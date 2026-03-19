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
        primary: {
          red: "#FF0033",
          blue: "#0066FF",
          yellow: "#FFD700",
          dark: "#0A0A0F",
          darker: "#050508",
        },
        glow: {
          red: "rgba(255,0,51,0.6)",
          blue: "rgba(0,102,255,0.6)",
          yellow: "rgba(255,215,0,0.6)",
        },
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
        exo: ["Exo 2", "sans-serif"],
      },
      animation: {
        "pulse-red": "pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-blue": "glow-blue 3s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "spark": "spark 1.5s ease-in-out infinite",
        "speed-line": "speed-line 2s linear infinite",
        "winner-reveal": "winner-reveal 0.5s ease-out forwards",
      },
      keyframes: {
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 5px #FF0033, 0 0 10px #FF0033" },
          "50%": { boxShadow: "0 0 20px #FF0033, 0 0 40px #FF0033" },
        },
        "glow-blue": {
          "0%": { textShadow: "0 0 10px #0066FF, 0 0 20px #0066FF" },
          "100%": { textShadow: "0 0 20px #0066FF, 0 0 40px #0066FF, 0 0 80px #0066FF" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spark": {
          "0%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
          "100%": { opacity: "0", transform: "scale(0)" },
        },
        "speed-line": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateX(100vw)", opacity: "0" },
        },
        "winner-reveal": {
          "0%": { transform: "scale(0) rotate(-10deg)", opacity: "0" },
          "60%": { transform: "scale(1.1) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern": "linear-gradient(rgba(0,102,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.1) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "50px 50px",
      },
    },
  },
  plugins: [],
};
export default config;
