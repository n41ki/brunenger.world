"use client";
import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={isLight ? "Modo oscuro" : "Modo claro"}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg btn-ghost transition-all ${className}`}
      style={{ fontSize: "12px", fontWeight: 600, color: "var(--t3)" }}
    >
      {isLight
        ? <Moon size={14} style={{ color: "var(--t2)" }} />
        : <Sun  size={14} style={{ color: "var(--t2)" }} />
      }
      <span className="hidden sm:inline" style={{ color: "var(--t3)" }}>
        {isLight ? "Oscuro" : "Claro"}
      </span>
    </button>
  );
}
