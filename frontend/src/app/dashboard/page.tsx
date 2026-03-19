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
  { href: "/dashboard/shop",      icon: ShoppingBag, label: "Tienda",   desc: "Canjea tus puntos"      },
  { href: "/dashboard/rankings",  icon: Trophy,      label: "Rankings", desc: "Top comunidad"          },
  { href: "/dashboard/giveaways", icon: Gift,        label: "Sorteos",  desc: "Participa y gana"       },
  { href: "/dashboard/stream",    icon: Tv,          label: "Stream",   desc: "Ve el stream en vivo"   },
];

export default function DashboardPage() {
  const [user,   setUser]   = useState<User | null>(null);
  const [stream, setStream] = useState<Stream>({ isLive: false });

  useEffect(() => {
    fetchCurrentUser().then(setUser);
    getStreamStatus().then(r => setStream(r.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">

      {/* Welcome row */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-10">
        <div className="flex items-center gap-4">
          {user?.avatar && (
            <div className="relative">
              <Image src={user.avatar} alt={user.username} width={46} height={46}
                className="rounded-full border border-[rgba(255,255,255,0.08)]" />
              {stream.isLive && <span className="live-dot absolute -bottom-0.5 -right-0.5 border-2 border-[#0B0B0B]" style={{ width:"8px", height:"8px" }} />}
            </div>
          )}
          <div>
            <p className="label mb-0.5">Bienvenido de vuelta</p>
            <h1 className="display text-[28px] tracking-widest text-white">{user?.username || "..."}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl card">
          <span className="bolt"><LightningIcon size={16} /></span>
          <div>
            <p className="label" style={{ fontSize: "10px" }}>PUNTOS</p>
            <p className="display text-[22px] tracking-widest accent">{(user?.puntos || 0).toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Live banner */}
      {stream.isLive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-between px-5 py-3.5 rounded-xl mb-6"
          style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.18)" }}>
          <div className="flex items-center gap-3">
            <span className="live-dot" />
            <span className="text-[13px] font-semibold accent tracking-wide">EN VIVO</span>
            {stream.title && <span className="text-[13px] text-[#444] hidden sm:block truncate max-w-xs">— {stream.title}</span>}
          </div>
          <Link href="/dashboard/stream">
            <button className="btn btn-orange text-[12px] px-4 py-1.5">
              <Play size={11} /> Ver stream
            </button>
          </Link>
        </motion.div>
      )}

      {/* Nav cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {CARDS.map((c, i) => (
          <motion.div key={c.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link href={c.href}>
              <div className="card p-5 cursor-pointer group">
                <c.icon size={20} className="accent mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-white text-[13px] mb-0.5">{c.label}</p>
                <p className="text-[12px] text-[#444]">{c.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="hr mb-8" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: TrendingUp,    v: "0h", l: "Watch time"       },
          { icon: MessageSquare, v: "0",  l: "Mensajes en chat" },
          { icon: Gift,          v: "0",  l: "Items canjeados"  },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
            className="card flex items-center gap-4 px-5 py-4">
            <s.icon size={18} className="text-[#2A2A2A]" />
            <div>
              <p className="display text-[22px] tracking-widest text-white">{s.v}</p>
              <p className="text-[11px] text-[#444]">{s.l}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
