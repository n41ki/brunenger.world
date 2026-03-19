"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { fetchCurrentUser, logout, isAuthenticated } from "@/lib/auth";
import { Menu, X, Zap, ShoppingBag, Trophy, Gift, Tv } from "lucide-react";

interface User {
  username: string;
  avatar: string;
  puntos: number;
  nivel: number;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Inicio", icon: Zap },
  { href: "/dashboard/shop", label: "Tienda", icon: ShoppingBag },
  { href: "/dashboard/rankings", label: "Rankings", icon: Trophy },
  { href: "/dashboard/giveaways", label: "Sorteos", icon: Gift },
  { href: "/dashboard/stream", label: "Stream", icon: Tv },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCurrentUser().then(setUser);
    }
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050508]/95 backdrop-blur-md border-b border-blue-500/20 box-glow-blue"
          : "bg-transparent"
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500/60 group-hover:border-blue-400 transition-colors"
              whileHover={{ scale: 1.08 }}
              style={{ boxShadow: "0 0 12px rgba(0,102,255,0.4)" }}
            >
              <Image
                src="https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp"
                alt="Brunenger"
                fill
                className="object-cover"
              />
            </motion.div>
            <span className="hidden sm:block font-orbitron font-bold text-sm tracking-wider text-white/80 group-hover:text-white transition-colors">
              BRUNENGER<span className="text-[#0066FF]"> WORLD</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.div
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-rajdhani font-semibold text-white/70 hover:text-white transition-all hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <link.icon size={14} />
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* User / CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <Zap size={14} className="text-yellow-400" />
                  <span className="text-yellow-400 font-orbitron font-bold text-sm">{user.puntos}</span>
                  <span className="text-white/50 text-xs">pts</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.avatar && (
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-blue-500/50"
                    />
                  )}
                  <span className="hidden sm:block text-sm font-semibold text-white/80">{user.username}</span>
                </div>
                <motion.button
                  onClick={() => logout()}
                  className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all"
                  whileTap={{ scale: 0.95 }}
                >
                  Salir
                </motion.button>
              </div>
            ) : (
              <Link href="/">
                <motion.button
                  className="px-4 py-2 font-orbitron font-bold text-sm bg-gradient-to-r from-red-600 to-blue-600 rounded-lg text-white shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,102,255,0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  INGRESAR
                </motion.button>
              </Link>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden text-white/70 hover:text-white"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
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
            className="md:hidden bg-[#050508]/98 backdrop-blur-md border-b border-blue-500/20"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-blue-500/10 transition-all">
                    <link.icon size={16} />
                    <span className="font-semibold">{link.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
