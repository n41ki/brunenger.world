"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Home, ShoppingBag, Trophy, Gift, Radio,
  ChevronRight, Zap, LogIn
} from "lucide-react";
import { getKickAuthUrl, isAuthenticated } from "@/lib/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";

const AVATAR  = "https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp";
const YT_ID   = "yzmLLn-InkM";

const NAV = [
  { label: "Inicio",   icon: Home,        active: true  },
  { label: "Tienda",   icon: ShoppingBag, active: false },
  { label: "Rankings", icon: Trophy,      active: false },
  { label: "Sorteos",  icon: Gift,        active: false },
  { label: "Stream",   icon: Radio,       active: false },
];

export default function HomePage() {
  const router   = useRouter();
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) { router.push("/dashboard"); return; }
    const saved = localStorage.getItem("bw-sidebar");
    if (saved === "1") setExpanded(true);
  }, [router]);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    localStorage.setItem("bw-sidebar", next ? "1" : "0");
  };

  const login = async () => {
    setLoading(true);
    window.location.href = await getKickAuthUrl();
  };

  const sw = expanded ? "220px" : "60px";

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f", display: "flex", overflow: "hidden" }}>

      {/* ── Background video (YouTube, muted autoplay) ─────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <iframe
          src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&loop=1&playlist=${YT_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "177.78vh", minWidth: "100%", height: "56.25vw", minHeight: "100%", border: "none" }}
          allow="autoplay; fullscreen"
          title="bg"
        />
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)" }} />
      </div>

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: sw, zIndex: 40,
        background: "rgba(13,13,15,0.85)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        display: "flex", flexDirection: "column",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>
        {/* Logo row */}
        <div style={{
          height: "60px", display: "flex", alignItems: "center",
          padding: "0 12px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", flex: 1 }}>
            <Image src={AVATAR} alt="Brunenger" width={32} height={32}
              style={{ borderRadius: "50%", border: "1.5px solid rgba(249,115,22,0.5)", flexShrink: 0 }} />
            {expanded && (
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "13px", color: "#fff", whiteSpace: "nowrap" }}>
                Brunenger World
              </p>
            )}
          </div>
          <button onClick={toggle} style={{
            width: "22px", height: "22px", borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}>
            <ChevronRight size={11} style={{ color: "#666", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.22s ease" }} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV.map((l, i) => (
            <div key={i}
              onClick={() => { if (!l.active) login(); }}
              title={!expanded ? l.label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px", borderRadius: "10px",
                color: l.active ? "#F97316" : "#555",
                background: l.active ? "rgba(249,115,22,0.1)" : "transparent",
                border: l.active ? "1px solid rgba(249,115,22,0.2)" : "1px solid transparent",
                cursor: l.active ? "default" : "pointer",
                whiteSpace: "nowrap", overflow: "hidden",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { if (!l.active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "#999"; }}
              onMouseLeave={e => { if (!l.active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#555"; } }}
            >
              <l.icon size={16} style={{ flexShrink: 0 }} />
              {expanded && <span style={{ fontSize: "13px", fontWeight: 500 }}>{l.label}</span>}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "6px" }}>
          {expanded ? (
            <>
              <ThemeToggle />
              <button onClick={login} disabled={loading} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                padding: "9px 14px", borderRadius: "10px", cursor: "pointer",
                background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)",
                color: "#F97316", fontSize: "12px", fontWeight: 700,
              }}>
                <LogIn size={13} /> {loading ? "..." : "Iniciar sesión"}
              </button>
            </>
          ) : (
            <>
              <div title="Toggle theme" style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
                <ThemeToggle />
              </div>
              <div title="Iniciar sesión" onClick={login} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "10px", borderRadius: "10px",
                background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", cursor: "pointer"
              }}>
                <LogIn size={14} style={{ color: "#F97316" }} />
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <main style={{
        marginLeft: sw, flex: 1, position: "relative", zIndex: 1,
        transition: "margin-left 0.22s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>

        {/* Top bar */}
        <div style={{
          height: "56px", display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "0 20px", flexShrink: 0,
        }}>
          <button onClick={login} disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 18px", borderRadius: "8px", cursor: "pointer",
              background: "#53FC18", border: "none",
              color: "#000", fontSize: "13px", fontWeight: 800,
              opacity: loading ? 0.7 : 1,
            }}>
            {/* Kick K icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h4v7.5l7-7.5H20l-8.5 9L20 21h-5.1l-6.9-7.5V21H4V3z"/></svg>
            {loading ? "Conectando..." : "Iniciar"}
          </button>
        </div>

        {/* Center content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "20px 24px 60px",
          textAlign: "center",
        }}>

          {/* Big title */}
          <h1 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(56px, 14vw, 140px)",
            color: "#ffffff",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            marginBottom: "4px",
            textShadow: "0 0 80px rgba(255,255,255,0.15)",
          }}>
            BRUNENGER
          </h1>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 6vw, 60px)",
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "0.3em",
            marginBottom: "48px",
            opacity: 0.9,
          }}>
            WORLD
          </h2>

          {/* YouTube video embed */}
          <div style={{
            width: "100%", maxWidth: "580px",
            borderRadius: "16px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            marginBottom: "28px",
            background: "#000",
          }}>
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${YT_ID}?rel=0&modestbranding=1`}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Brunenger World"
              />
            </div>
          </div>

          {/* CTA button */}
          <button onClick={login} disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "14px 40px", borderRadius: "999px",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", fontSize: "15px", fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.02em",
              transition: "all 0.2s ease",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.2)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(249,115,22,0.5)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
          >
            <Zap size={16} style={{ color: "#F97316" }} />
            {loading ? "Conectando..." : "Iniciar sesión con Kick"}
          </button>

        </div>
      </main>
    </div>
  );
}
