"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { fetchCurrentUser } from "@/lib/auth";
import { getStreamStatus } from "@/lib/api";
import { ShoppingBag, Trophy, Gift, Tv, Zap, TrendingUp, Users, Star } from "lucide-react";

interface User { username: string; avatar: string; puntos: number; nivel: number }
interface Stream { isLive: boolean; viewers?: number; title?: string }

const DASHBOARD_CARDS = [
  {
    href: "/dashboard/shop",
    icon: ShoppingBag,
    title: "Tienda",
    desc: "Canjea tus puntos por premios exclusivos",
    color: "from-blue-600/20 to-blue-600/5",
    border: "border-blue-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(0,102,255,0.3)]",
    iconColor: "text-blue-400",
  },
  {
    href: "/dashboard/rankings",
    icon: Trophy,
    title: "Rankings",
    desc: "Top viewers, chatters y supporters",
    color: "from-yellow-600/20 to-yellow-600/5",
    border: "border-yellow-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]",
    iconColor: "text-yellow-400",
  },
  {
    href: "/dashboard/giveaways",
    icon: Gift,
    title: "Sorteos",
    desc: "Participa en sorteos y gana premios",
    color: "from-red-600/20 to-red-600/5",
    border: "border-red-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(255,0,51,0.3)]",
    iconColor: "text-red-400",
  },
  {
    href: "/dashboard/stream",
    icon: Tv,
    title: "Stream",
    desc: "Ve el stream en vivo desde aquí",
    color: "from-purple-600/20 to-purple-600/5",
    border: "border-purple-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    iconColor: "text-purple-400",
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stream, setStream] = useState<Stream>({ isLive: false });

  useEffect(() => {
    fetchCurrentUser().then(setUser);
    getStreamStatus().then((r) => setStream(r.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
      >
        <div className="flex items-center gap-4">
          {user?.avatar && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="relative"
            >
              <Image
                src={user.avatar}
                alt={user.username}
                width={64}
                height={64}
                className="rounded-full border-2 border-blue-500/50"
              />
              <div className="absolute inset-0 rounded-full animate-ping border-2 border-blue-500/30" />
            </motion.div>
          )}
          <div>
            <p className="text-white/50 text-sm font-rajdhani">Bienvenido de vuelta,</p>
            <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white">
              {user?.username || "Cargando..."}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Star size={12} className="text-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold">Nivel {user?.nivel || 1}</span>
            </div>
          </div>
        </div>

        {/* Points card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-xl"
        >
          <Zap size={24} className="text-yellow-400" />
          <div>
            <p className="text-white/50 text-xs">Tus puntos</p>
            <p className="font-orbitron font-black text-2xl text-yellow-400">{(user?.puntos || 0).toLocaleString()}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stream status banner */}
      {stream.isLive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </div>
            <span className="font-orbitron font-bold text-red-400 text-sm">EN VIVO AHORA</span>
            {stream.title && <span className="text-white/70 text-sm hidden sm:block">— {stream.title}</span>}
            {stream.viewers && (
              <div className="flex items-center gap-1 text-white/50 text-sm">
                <Users size={14} />
                {stream.viewers.toLocaleString()}
              </div>
            )}
          </div>
          <Link href="/dashboard/stream">
            <motion.button
              className="px-4 py-1.5 bg-red-600 text-white font-bold text-sm rounded-lg font-orbitron"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              VER STREAM
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {DASHBOARD_CARDS.map((card, i) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={card.href}>
              <motion.div
                className={`p-6 rounded-xl border ${card.border} bg-gradient-to-br ${card.color} cursor-pointer transition-all duration-300 ${card.glow} hover:-translate-y-1`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <card.icon size={32} className={`${card.iconColor} mb-4`} />
                <h3 className="font-orbitron font-bold text-lg text-white mb-1">{card.title}</h3>
                <p className="text-white/50 text-sm font-rajdhani">{card.desc}</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { icon: TrendingUp, label: "Watch Time", value: "0h", sub: "tiempo de stream visto", color: "text-blue-400" },
          { icon: Users, label: "Mensajes en Chat", value: "0", sub: "mensajes enviados", color: "text-green-400" },
          { icon: Gift, label: "Canjes", value: "0", sub: "items canjeados", color: "text-purple-400" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-white/10 bg-white/5 flex items-center gap-4"
          >
            <stat.icon size={28} className={stat.color} />
            <div>
              <p className="font-orbitron font-black text-xl text-white">{stat.value}</p>
              <p className="text-white/40 text-xs">{stat.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
