"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { fetchCurrentUser, logout, isAuthenticated } from "@/lib/auth";
import { Menu, X, Zap } from "lucide-react";
import LightningIcon from "@/components/ui/LightningIcon";

interface User { username: string; avatar: string; puntos: number; nivel: number }

const NAV_LINKS = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/dashboard/stream", label: "Stream" },
  { href: "/dashboard/shop", label: "Tienda" },
  { href: "/dashboard/rankings", label: "Rankings" },
  { href: "/dashboard/giveaways", label: "Sorteos" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) fetchCurrentUser().then(setUser);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0B0B0B]/95 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="lightning-glow">
              <LightningIcon size={22} />
            </div>
            <span className="font-display text-xl tracking-widest text-white group-hover:text-orange transition-colors duration-200">
              BRUNENGER
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                <span className="px-4 py-2 text-sm font-body font-medium text-[#888] hover:text-white transition-colors duration-200 tracking-wide">
                  {l.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C1C] border border-white/6">
                  <Zap size={12} className="text-orange" />
                  <span className="font-body font-semibold text-sm text-orange">{user.puntos.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.avatar && (
                    <Image src={user.avatar} alt={user.username} width={30} height={30}
                      className="rounded-full border border-white/10" />
                  )}
                  <span className="hidden sm:block text-sm font-body font-medium text-[#888]">{user.username}</span>
                </div>
                <button onClick={() => logout()}
                  className="text-xs font-body text-[#555] hover:text-[#888] transition-colors">
                  Salir
                </button>
              </div>
            ) : (
              <Link href="/">
                <motion.button
                  className="px-5 py-2 rounded-lg btn-primary text-sm font-body font-semibold tracking-wide"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Ingresar
                </motion.button>
              </Link>
            )}
            <button className="md:hidden text-[#888] hover:text-white" onClick={() => setOpen(!open)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#111] border-b border-white/5"
          >
            <div className="px-6 py-4 space-y-1">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                  <div className="py-2.5 text-sm font-body text-[#888] hover:text-white transition-colors">{l.label}</div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
