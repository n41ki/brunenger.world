"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Radio, ShoppingBag, Trophy, Gift, LogOut, Menu, X, Zap } from "lucide-react";
import { fetchCurrentUser, logout } from "@/lib/auth";
import LightningIcon from "@/components/ui/LightningIcon";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface User { username: string; avatar: string; puntos: number }

const LINKS = [
  { href: "/dashboard/stream",    label: "Stream",   icon: Radio      },
  { href: "/dashboard/shop",      label: "Tienda",   icon: ShoppingBag },
  { href: "/dashboard/rankings",  label: "Rankings", icon: Trophy     },
  { href: "/dashboard/giveaways", label: "Sorteos",  icon: Gift       },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser]   = useState<User | null>(null);
  const [open, setOpen]   = useState(false);

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => {});
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="sidebar-overlay md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile topbar */}
      <div className="md:hidden" style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "56px", zIndex: 45,
        background: "var(--bg1)", borderBottom: "1px solid var(--glass-border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="bolt"><LightningIcon size={18} /></span>
          <span className="display" style={{ fontSize: "16px", letterSpacing: "0.1em", color: "var(--t1)" }}>BRUNENGER</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ThemeToggle />
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => setOpen(!open)}
            style={{ width: "34px", height: "34px" }}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span className="bolt"><LightningIcon size={20} /></span>
            <span className="display" style={{ fontSize: "18px", letterSpacing: "0.12em", color: "var(--t1)" }}>BRUNENGER</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {LINKS.map(l => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href} href={l.href}
                className={`sidebar-link ${active ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <l.icon size={16} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Points pill */}
          {user && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px", borderRadius: "10px",
              background: "var(--orange-bg)", border: "1px solid var(--orange-bd)"
            }}>
              <Zap size={13} style={{ color: "var(--orange)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "10px", color: "var(--orange)", fontWeight: 700, letterSpacing: "0.1em" }}>TUS PUNTOS</p>
                <p className="display" style={{ fontSize: "18px", color: "var(--orange)", lineHeight: 1 }}>
                  {user.puntos.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* User row */}
          {user && (
            <div className="sidebar-user">
              {user.avatar && (
                <Image src={user.avatar} alt={user.username} width={30} height={30}
                  style={{ borderRadius: "50%", border: "1.5px solid var(--border2)", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.username}
                </p>
              </div>
              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                <ThemeToggle />
                <button
                  onClick={() => logout()}
                  className="btn btn-icon btn-ghost"
                  style={{ width: "28px", height: "28px" }}
                  title="Salir"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
