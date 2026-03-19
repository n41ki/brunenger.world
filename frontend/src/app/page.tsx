"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home, ShoppingBag, Trophy, Gift, Radio,
  ChevronRight, LogOut
} from "lucide-react";
import { getKickAuthUrl, isAuthenticated, fetchCurrentUser, logout } from "@/lib/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";

const AVATAR  = "https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp";
const YT_ID   = "yzmLLn-InkM";
const KICK_CHANNEL = "brunenger";
const KICK_GREEN = "#53FC18";

const KickIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 3h4v7.5l7-7.5H20l-8.5 9L20 21h-5.1l-6.9-7.5V21H4V3z"/>
  </svg>
);

const NAV = [
  { label: "Inicio",   icon: Home,        href: "/dashboard"           },
  { label: "Tienda",   icon: ShoppingBag, href: "/dashboard/shop"      },
  { label: "Rankings", icon: Trophy,      href: "/dashboard/rankings"  },
  { label: "Sorteos",  icon: Gift,        href: "/dashboard/giveaways" },
  { label: "Stream",   icon: Radio,       href: "/dashboard/stream"    },
];

interface User { username: string; avatar: string; puntos: number }

export default function HomePage() {
  const router   = useRouter();
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [authed,   setAuthed]   = useState(false);
  const [user,     setUser]     = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("bw-sidebar");
    if (saved === "1") setExpanded(true);
    if (isAuthenticated()) {
      setAuthed(true);
      fetchCurrentUser().then(setUser).catch(() => {});
    }
  }, []);

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
    <div style={{ minHeight: "100vh", background: "#0a0a0c", display: "flex", overflow: "hidden" }}>

      {/* ── Background video ─────────────────────────────────────────── */}
      <div className="video-bg">
        <iframe
          src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&loop=1&playlist=${YT_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
          allow="autoplay; fullscreen"
          title="bg"
        />
        <div className="video-bg-overlay" />
      </div>

      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: sw, zIndex: 40,
        background: "rgba(10,10,12,0.85)",
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
              style={{ borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
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
          {NAV.map((l, i) => {
            const isHome = i === 0;
            if (authed) {
              return (
                <Link key={i} href={l.href} title={!expanded ? l.label : undefined} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px", borderRadius: "10px",
                  color: isHome ? "#fff" : "#555",
                  background: isHome ? "rgba(255,255,255,0.08)" : "transparent",
                  border: isHome ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                  textDecoration: "none",
                  whiteSpace: "nowrap", overflow: "hidden",
                  transition: "all 0.15s ease",
                }}
                  onMouseEnter={e => { if (!isHome) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "#999"; } }}
                  onMouseLeave={e => { if (!isHome) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#555"; } }}
                >
                  <l.icon size={16} style={{ flexShrink: 0 }} />
                  {expanded && <span style={{ fontSize: "13px", fontWeight: 500 }}>{l.label}</span>}
                </Link>
              );
            }
            return (
              <div key={i}
                onClick={() => { if (!isHome) login(); }}
                title={!expanded ? l.label : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px", borderRadius: "10px",
                  color: isHome ? "#fff" : "#555",
                  background: isHome ? "rgba(255,255,255,0.08)" : "transparent",
                  border: isHome ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                  cursor: isHome ? "default" : "pointer",
                  whiteSpace: "nowrap", overflow: "hidden",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => { if (!isHome) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "#999"; } }}
                onMouseLeave={e => { if (!isHome) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#555"; } }}
              >
                <l.icon size={16} style={{ flexShrink: 0 }} />
                {expanded && <span style={{ fontSize: "13px", fontWeight: 500 }}>{l.label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "6px" }}>
          {authed && user ? (
            expanded ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 4px" }}>
                {user.avatar && (
                  <Image src={user.avatar} alt={user.username} width={28} height={28}
                    style={{ borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.12)", flexShrink: 0 }} />
                )}
                <p style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.username}
                </p>
                <ThemeToggle />
                <button onClick={() => logout()} title="Cerrar sesión"
                  style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <LogOut size={12} style={{ color: "#f87171" }} />
                </button>
              </div>
            ) : (
              <button onClick={() => logout()} title="Cerrar sesión" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "10px", borderRadius: "10px",
                background: "transparent", border: "1px solid transparent", cursor: "pointer",
              }}>
                <LogOut size={14} style={{ color: "#f87171" }} />
              </button>
            )
          ) : (
            expanded ? (
              <>
                <ThemeToggle />
                <button onClick={login} disabled={loading} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  padding: "9px 14px", borderRadius: "10px", cursor: "pointer",
                  background: "rgba(83,252,24,0.12)", border: "1px solid rgba(83,252,24,0.3)",
                  color: KICK_GREEN, fontSize: "12px", fontWeight: 700,
                }}>
                  <KickIcon size={12} /> {loading ? "..." : "Iniciar sesión"}
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
                  background: "rgba(83,252,24,0.1)", border: "1px solid rgba(83,252,24,0.25)", cursor: "pointer"
                }}>
                  <KickIcon size={14} />
                </div>
              </>
            )
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
          {authed ? (
            <Link href="/dashboard" style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 18px", borderRadius: "8px", cursor: "pointer",
              background: "#fff", border: "none",
              color: "#000", fontSize: "13px", fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(255,255,255,0.1)",
            }}>
              Dashboard
            </Link>
          ) : (
            <button onClick={login} disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 18px", borderRadius: "8px", cursor: "pointer",
                background: KICK_GREEN, border: "none",
                color: "#000", fontSize: "13px", fontWeight: 800,
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 16px rgba(83,252,24,0.25)",
              }}>
              <KickIcon size={14} />
              {loading ? "Conectando..." : "Iniciar con Kick"}
            </button>
          )}
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

          {/* Kick channel embed */}
          <div style={{
            width: "100%", maxWidth: "580px",
            borderRadius: "16px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            marginBottom: "12px",
            background: "#000",
          }}>
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe
                src={`https://player.kick.com/${KICK_CHANNEL}`}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                allowFullScreen
                title="Brunenger Kick"
              />
            </div>
          </div>
          {/* Channel link */}
          <a href={`https://kick.com/${KICK_CHANNEL}`} target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "12px", color: "rgba(255,255,255,0.4)",
              marginBottom: "32px", textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = KICK_GREEN)}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            <KickIcon size={11} /> kick.com/{KICK_CHANNEL}
          </a>

          {/* CTA */}
          {authed ? (
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { label: "Tienda", href: "/dashboard/shop", icon: ShoppingBag },
                { label: "Rankings", href: "/dashboard/rankings", icon: Trophy },
                { label: "Sorteos", href: "/dashboard/giveaways", icon: Gift },
              ].map(c => (
                <Link key={c.href} href={c.href} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 24px", borderRadius: "999px",
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff", fontSize: "13px", fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
                >
                  <c.icon size={14} />
                  {c.label}
                </Link>
              ))}
            </div>
          ) : (
            <button onClick={login} disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "14px 40px", borderRadius: "999px",
                background: "rgba(83,252,24,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(83,252,24,0.3)",
                color: KICK_GREEN, fontSize: "15px", fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.02em",
                transition: "all 0.2s ease",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 30px rgba(83,252,24,0.08)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(83,252,24,0.2)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(83,252,24,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(83,252,24,0.1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(83,252,24,0.3)"; }}
            >
              <KickIcon size={16} />
              {loading ? "Conectando..." : "Iniciar sesión con Kick"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
