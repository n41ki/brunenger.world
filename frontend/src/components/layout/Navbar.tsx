"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Zap } from "lucide-react";
import { fetchCurrentUser, logout, isAuthenticated } from "@/lib/auth";
import LightningIcon from "@/components/ui/LightningIcon";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface User { username: string; avatar: string; puntos: number }

const LINKS = [
  { href: "/dashboard/stream",    label: "Stream"   },
  { href: "/dashboard/shop",      label: "Tienda"   },
  { href: "/dashboard/rankings",  label: "Rankings" },
  { href: "/dashboard/giveaways", label: "Sorteos"  },
];

export default function Navbar() {
  const [user,    setUser]    = useState<User | null>(null);
  const [open,    setOpen]    = useState(false);
  const [scrolled,setScrolled]= useState(false);

  useEffect(() => {
    if (isAuthenticated()) fetchCurrentUser().then(setUser);
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`navbar ${scrolled ? "scrolled" : ""}`}
      style={{ height: "56px" }}
    >
      <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" style={{ textDecoration: "none" }}>
          <span className="bolt"><LightningIcon size={19} /></span>
          <span className="display" style={{
            fontSize: "17px", letterSpacing: "0.1em",
            color: "var(--t1)", transition: "color 0.2s"
          }}>
            BRUNENGER
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
              <span style={{
                display: "block", padding: "6px 14px", borderRadius: "8px",
                fontSize: "13px", fontWeight: 500, color: "var(--t3)",
                transition: "color 0.15s, background 0.15s",
              }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--t1)"; (e.target as HTMLElement).style.background = "var(--bg2)"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = "var(--t3)"; (e.target as HTMLElement).style.background = "transparent"; }}
              >
                {l.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ background: "var(--orange-bg)", border: "1px solid var(--orange-bd)" }}>
                <Zap size={11} style={{ color: "var(--orange)" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--orange)" }}>
                  {user.puntos.toLocaleString()}
                </span>
              </div>
              {user.avatar && (
                <Image src={user.avatar} alt={user.username} width={28} height={28}
                  className="rounded-full" style={{ border: "1.5px solid var(--border2)" }} />
              )}
              <button onClick={() => logout()} className="btn btn-sm btn-ghost" style={{ padding: "5px 12px" }}>
                Salir
              </button>
            </>
          ) : (
            <Link href="/">
              <button className="btn btn-primary btn-sm">Ingresar</button>
            </Link>
          )}

          <button
            className="md:hidden btn btn-icon btn-ghost"
            onClick={() => setOpen(!open)}
            style={{ width: "34px", height: "34px" }}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ background: "var(--bg1)", borderBottom: "1px solid var(--border)", overflow: "hidden" }}
          >
            <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "10px 12px", borderRadius: "8px", fontSize: "14px", color: "var(--t2)" }}>
                    {l.label}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
