"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { fetchCurrentUser } from "@/lib/auth";
import { getStreamStatus } from "@/lib/api";
import { Zap, ShoppingBag, Trophy, Gift, Tv, Play, TrendingUp, MessageSquare } from "lucide-react";
import LightningIcon from "@/components/ui/LightningIcon";

interface User  { username: string; avatar: string; puntos: number; nivel: number }
interface Stream { isLive: boolean; viewers?: number; title?: string }

const CARDS = [
  { href: "/dashboard/shop",      icon: ShoppingBag, label: "Tienda",   desc: "Canjea tus puntos",          accent: "orange" },
  { href: "/dashboard/rankings",  icon: Trophy,      label: "Rankings", desc: "Top de la comunidad",        accent: "gold"   },
  { href: "/dashboard/giveaways", icon: Gift,        label: "Sorteos",  desc: "Participa y gana",           accent: "cyan"   },
  { href: "/dashboard/stream",    icon: Tv,          label: "Stream",   desc: "Ve el stream en vivo",       accent: "orange" },
];

const accentMap: Record<string, string> = {
  orange: "text-[#FF6B00] bg-[#FF6B00]/10 border-[#FF6B00]/20 hover:border-[#FF6B00]/40",
  gold:   "text-[#C9A84C] bg-[#C9A84C]/10 border-[#C9A84C]/20 hover:border-[#C9A84C]/40",
  cyan:   "text-[#00BFFF] bg-[#00BFFF]/10 border-[#00BFFF]/20 hover:border-[#00BFFF]/40",
};

export default function DashboardPage() {
  const [user, setUser]   = useState<User | null>(null);
  const [stream, setStream] = useState<Stream>({ isLive: false });

  useEffect(() => {
    fetchCurrentUser().then(setUser);
    getStreamStatus().then((r) => setStream(r.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12"
      >
        <div className="flex items-center gap-4">
          {user?.avatar && (
            <div className="relative">
              <Image src={user.avatar} alt={user.username} width={52} height={52}
                className="rounded-full border border-white/10" />
              {stream.isLive && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF6B00] border-2 border-[#0B0B0B] live-dot" />
              )}
            </div>
          )}
          <div>
            <p className="text-xs font-body text-[#444] tracking-wider mb-0.5">Bienvenido de vuelta</p>
            <h1 className="font-display text-3xl tracking-widest text-white">{user?.username || "..."}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#1C1C1C] border border-white/6">
          <div className="lightning-glow"><LightningIcon size={18} /></div>
          <div>
            <p className="text-[10px] font-body text-[#444] tracking-wider mb-0.5">TUS PUNTOS</p>
            <p className="font-display text-2xl tracking-widest text-[#FF6B00]">{(user?.puntos || 0).toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Live banner */}
      {stream.isLive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-[#FF6B00]/8 border border-[#FF6B00]/25 mb-8"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00] live-dot" />
            <span className="font-body font-semibold text-sm text-[#FF6B00]">EN VIVO AHORA</span>
            {stream.title && <span className="text-sm text-[#666] hidden sm:block">— {stream.title}</span>}
          </div>
          <Link href="/dashboard/stream">
            <motion.button
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg btn-primary text-xs font-body font-semibold"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <Play size={12} />
              Ver stream
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* Nav cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
        {CARDS.map((c, i) => (
          <motion.div
            key={c.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link href={c.href}>
              <div className={`p-5 rounded-xl border bg-[#1C1C1C] cursor-pointer transition-all duration-300 hover:-translate-y-1 ${accentMap[c.accent]}`}>
                <c.icon size={22} className="mb-3" />
                <p className="font-body font-semibold text-white text-sm mb-0.5">{c.label}</p>
                <p className="font-body text-xs text-[#555]">{c.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="divider-subtle mb-8" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {[
          { icon: TrendingUp,    label: "Watch Time",       value: "0h",  sub: "tiempo visto" },
          { icon: MessageSquare, label: "Mensajes en Chat", value: "0",   sub: "mensajes" },
          { icon: Gift,          label: "Items Canjeados",  value: "0",   sub: "canjes" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-4 p-5 rounded-xl bg-[#111] border border-white/5">
            <s.icon size={20} className="text-[#333]" />
            <div>
              <p className="font-display text-2xl tracking-widest text-white">{s.value}</p>
              <p className="text-xs font-body text-[#444]">{s.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
