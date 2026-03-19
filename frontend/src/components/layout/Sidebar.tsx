"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home, ShoppingBag, Trophy, Gift, Radio,
  LogOut, ChevronRight, Zap, Settings
} from "lucide-react";
import { fetchCurrentUser, logout } from "@/lib/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";

const AVATAR = "https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp";

interface User { username: string; avatar: string; puntos: number; es_admin?: boolean }

const LINKS = [
  { href: "/dashboard",           label: "Inicio",   icon: Home       },
  { href: "/dashboard/stream",    label: "Stream",   icon: Radio      },
  { href: "/dashboard/shop",      label: "Tienda",   icon: ShoppingBag },
  { href: "/dashboard/rankings",  label: "Rankings", icon: Trophy     },
  { href: "/dashboard/giveaways", label: "Sorteos",  icon: Gift       },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const [user,     setUser]    = useState<User | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [mobile,   setMobile]  = useState(false);

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => {});
    const saved = localStorage.getItem("bw-sidebar");
    if (saved !== null) setExpanded(saved === "1");
    const mq = window.matchMedia("(max-width:768px)");
    setMobile(mq.matches);
    const fn = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    localStorage.setItem("bw-sidebar", next ? "1" : "0");
  };

  const w = expanded ? "220px" : "60px";

  if (mobile) return <MobileBar user={user} pathname={pathname} />;

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0,
      width: w, zIndex: 40,
      background: "var(--bg1)",
      borderRight: "1px solid var(--glass-border)",
      display: "flex", flexDirection: "column",
      transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden",
    }}>
      {/* Logo + collapse toggle */}
      <div style={{
        height: "60px", display: "flex", alignItems: "center",
        padding: "0 12px", borderBottom: "1px solid var(--glass-border)",
        flexShrink: 0, position: "relative",
      }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", overflow: "hidden", flex: 1 }}>
          <Image src={AVATAR} alt="Brunenger" width={32} height={32}
            style={{ borderRadius: "50%", border: "1.5px solid var(--orange-bd)", flexShrink: 0 }} />
          {expanded && (
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "14px", color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden" }}>
              Brunenger World
            </span>
          )}
        </Link>
        <button onClick={toggle} style={{
          width: "24px", height: "24px", borderRadius: "50%",
          background: "var(--bg3)", border: "1px solid var(--glass-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          transition: "transform 0.22s ease",
        }}>
          <ChevronRight size={12} style={{ color: "var(--t3)", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.22s ease" }} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto", overflowX: "hidden" }}>
        {LINKS.map(l => {
          const exact = l.href === "/dashboard";
          const active = exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} title={!expanded ? l.label : undefined} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px", borderRadius: "10px",
              color: active ? "var(--orange)" : "var(--t3)",
              background: active ? "var(--orange-bg)" : "transparent",
              border: active ? "1px solid var(--orange-bd)" : "1px solid transparent",
              textDecoration: "none",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap", overflow: "hidden",
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--glass-bg)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <l.icon size={16} style={{ flexShrink: 0 }} />
              {expanded && <span style={{ fontSize: "13px", fontWeight: 500 }}>{l.label}</span>}
            </Link>
          );
        })}

        {user?.es_admin && (
          <Link href="/admin" title={!expanded ? "Admin" : undefined} style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "10px", borderRadius: "10px",
            color: pathname.startsWith("/admin") ? "var(--orange)" : "var(--t4)",
            background: pathname.startsWith("/admin") ? "var(--orange-bg)" : "transparent",
            border: "1px solid transparent", textDecoration: "none",
            transition: "all 0.15s ease", whiteSpace: "nowrap", overflow: "hidden",
          }}>
            <Settings size={16} style={{ flexShrink: 0 }} />
            {expanded && <span style={{ fontSize: "13px", fontWeight: 500 }}>Admin</span>}
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", gap: "6px" }}>
        {/* Points */}
        {user && expanded && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 12px", borderRadius: "10px",
            background: "var(--orange-bg)", border: "1px solid var(--orange-bd)"
          }}>
            <Zap size={13} style={{ color: "var(--orange)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "10px", color: "var(--orange)", fontWeight: 700, letterSpacing: "0.1em" }}>PUNTOS</p>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "16px", color: "var(--orange)", lineHeight: 1 }}>
                {user.puntos.toLocaleString()}
              </p>
            </div>
          </div>
        )}
        {user && !expanded && (
          <div title={`${user.puntos} puntos`} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "10px", borderRadius: "10px",
            background: "var(--orange-bg)", border: "1px solid var(--orange-bd)"
          }}>
            <Zap size={14} style={{ color: "var(--orange)" }} />
          </div>
        )}

        {/* User + actions */}
        {user && expanded && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 4px" }}>
            {user.avatar && (
              <Image src={user.avatar} alt={user.username} width={28} height={28}
                style={{ borderRadius: "50%", border: "1.5px solid var(--border2)", flexShrink: 0 }} />
            )}
            <p style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.username}
            </p>
            <ThemeToggle />
            <button onClick={() => logout()} title="Cerrar sesión"
              style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <LogOut size={12} style={{ color: "#f87171" }} />
            </button>
          </div>
        )}
        {user && !expanded && (
          <button onClick={() => logout()} title="Cerrar sesión" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "10px", borderRadius: "10px",
            background: "transparent", border: "1px solid transparent", cursor: "pointer",
          }}>
            <LogOut size={14} style={{ color: "#f87171" }} />
          </button>
        )}
      </div>
    </aside>
  );
}

// ── Mobile bottom bar ───────────────────────────────────────────────────────
function MobileBar({ user, pathname }: { user: User | null; pathname: string }) {
  const links = [
    { href: "/dashboard",           icon: Home       },
    { href: "/dashboard/stream",    icon: Radio      },
    { href: "/dashboard/shop",      icon: ShoppingBag },
    { href: "/dashboard/rankings",  icon: Trophy     },
    { href: "/dashboard/giveaways", icon: Gift       },
  ];
  return (
    <>
      {/* Top bar on mobile */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "52px", zIndex: 45,
        background: "var(--bg1)", borderBottom: "1px solid var(--glass-border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px"
      }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <Image src={AVATAR} alt="Brunenger" width={26} height={26} style={{ borderRadius: "50%", border: "1.5px solid var(--orange-bd)" }} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "13px", color: "var(--t1)" }}>Brunenger World</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Zap size={12} style={{ color: "var(--orange)" }} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "13px", color: "var(--orange)" }}>{user.puntos.toLocaleString()}</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: "56px", zIndex: 45,
        background: "var(--bg1)", borderTop: "1px solid var(--glass-border)",
        display: "flex", alignItems: "center",
      }}>
        {links.map(l => {
          const exact = l.href === "/dashboard";
          const active = exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} style={{
              flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100%",
              color: active ? "var(--orange)" : "var(--t4)", textDecoration: "none",
            }}>
              <l.icon size={18} />
            </Link>
          );
        })}
      </div>
    </>
  );
}
