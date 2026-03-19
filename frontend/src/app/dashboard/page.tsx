"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { fetchCurrentUser } from "@/lib/auth";
import { getStreamStatus } from "@/lib/api";
import { Zap, ShoppingBag, Trophy, Gift, Tv, Play, TrendingUp, MessageSquare } from "lucide-react";

interface User  { username: string; avatar: string; puntos: number; nivel: number }
interface Stream { isLive: boolean; viewers?: number; title?: string }

const CARDS = [
  { href: "/dashboard/shop",      icon: ShoppingBag, label: "Tienda",   desc: "Canjea tus puntos"    },
  { href: "/dashboard/rankings",  icon: Trophy,      label: "Rankings", desc: "Top comunidad"        },
  { href: "/dashboard/giveaways", icon: Gift,        label: "Sorteos",  desc: "Participa y gana"     },
  { href: "/dashboard/stream",    icon: Tv,          label: "Stream",   desc: "Ve el stream en vivo" },
];

export default function DashboardPage() {
  const [user,   setUser]   = useState<User | null>(null);
  const [stream, setStream] = useState<Stream>({ isLive: false });

  useEffect(() => {
    fetchCurrentUser().then(setUser);
    getStreamStatus().then(r => setStream(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: "32px 28px", maxWidth: "1000px" }}>

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {user?.avatar && (
            <div style={{ position: "relative" }}>
              <Image src={user.avatar} alt={user.username} width={48} height={48}
                style={{ borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.12)" }} />
              {stream.isLive && <span className="live-dot" style={{ position: "absolute", bottom: "0", right: "0", width: "10px", height: "10px", border: "2px solid var(--bg)" }} />}
            </div>
          )}
          <div>
            <p className="label" style={{ marginBottom: "3px" }}>Bienvenido de vuelta</p>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "26px", color: "#fff", lineHeight: 1.1 }}>
              {user?.username || "..."}
            </h1>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "12px 18px", borderRadius: "12px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <Zap size={16} style={{ color: "#fff" }} />
          <div>
            <p style={{ fontSize: "10px", color: "var(--t3)", fontWeight: 700, letterSpacing: "0.1em" }}>PUNTOS</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "22px", color: "#fff", lineHeight: 1 }}>
              {(user?.puntos || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Live banner */}
      {stream.isLive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px", borderRadius: "12px", marginBottom: "24px",
            background: "rgba(83,252,24,0.06)", border: "1px solid rgba(83,252,24,0.2)"
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#53FC18", letterSpacing: "0.06em" }}>EN VIVO</span>
            {stream.title && <span style={{ fontSize: "13px", color: "var(--t4)" }}>— {stream.title}</span>}
          </div>
          <Link href="/dashboard/stream">
            <button className="btn btn-sm" style={{ background: "#53FC18", color: "#000" }}>
              <Play size={11} /> Ver stream
            </button>
          </Link>
        </motion.div>
      )}

      {/* Nav cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px", marginBottom: "32px" }}>
        {CARDS.map((c, i) => (
          <motion.div key={c.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link href={c.href} style={{ textDecoration: "none" }}>
              <div className="card card-hover" style={{ padding: "20px", cursor: "pointer" }}>
                <c.icon size={20} style={{ color: "#fff", marginBottom: "12px" }} />
                <p style={{ fontWeight: 600, color: "var(--t1)", fontSize: "13px", marginBottom: "3px" }}>{c.label}</p>
                <p style={{ fontSize: "12px", color: "var(--t3)" }}>{c.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="hr" style={{ marginBottom: "28px" }} />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
        {[
          { icon: TrendingUp,    v: "0h", l: "Watch time"       },
          { icon: MessageSquare, v: "0",  l: "Mensajes en chat" },
          { icon: Gift,          v: "0",  l: "Items canjeados"  },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
            className="card" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "18px 20px" }}>
            <s.icon size={18} style={{ color: "var(--t4)", flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--t1)", lineHeight: 1 }}>{s.v}</p>
              <p style={{ fontSize: "11px", color: "var(--t3)", marginTop: "3px" }}>{s.l}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
