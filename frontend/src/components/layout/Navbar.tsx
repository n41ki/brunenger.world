"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Zap } from "lucide-react";
import { fetchCurrentUser, logout, isAuthenticated } from "@/lib/auth";
import LightningIcon from "@/components/ui/LightningIcon";

interface User { username: string; avatar: string; puntos: number }

const LINKS = [
  { href: "/dashboard/stream",    label: "Stream"   },
  { href: "/dashboard/shop",      label: "Tienda"   },
  { href: "/dashboard/rankings",  label: "Rankings" },
  { href: "/dashboard/giveaways", label: "Sorteos"  },
];

export default function Navbar() {
  const [user, setUser]       = useState<User | null>(null);
  const [open, setOpen]       = useState(false);
  const [solid, setSolid]     = useState(false);

  useEffect(() => {
    if (isAuthenticated()) fetchCurrentUser().then(setUser);
    const fn = () => setSolid(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solid ? "bg-[#0B0B0B]/95 backdrop-blur-sm border-b border-[rgba(255,255,255,0.07)]" : ""}`}>
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="bolt"><LightningIcon size={20} /></span>
          <span className="display text-[18px] tracking-[0.08em] text-white group-hover:text-[#F97316] transition-colors">
            BRUNENGER
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="px-4 py-2 text-[13px] font-medium text-[#555] hover:text-white transition-colors rounded-md hover:bg-white/[0.04]">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161616] border border-[rgba(255,255,255,0.07)]">
                <Zap size={11} className="accent" />
                <span className="text-[13px] font-semibold accent">{user.puntos.toLocaleString()}</span>
              </div>
              {user.avatar && (
                <Image src={user.avatar} alt={user.username} width={28} height={28}
                  className="rounded-full border border-[rgba(255,255,255,0.1)]" />
              )}
              <button onClick={() => logout()} className="text-[12px] text-[#444] hover:text-[#888] transition-colors">
                Salir
              </button>
            </>
          ) : (
            <Link href="/">
              <button className="btn btn-orange text-[13px] px-5 py-2">Ingresar</button>
            </Link>
          )}
          <button className="md:hidden text-[#555] hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#111] border-b border-[rgba(255,255,255,0.07)]">
            <div className="px-5 py-3 flex flex-col gap-1">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="py-2.5 text-[13px] text-[#555] hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
