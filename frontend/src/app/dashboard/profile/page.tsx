"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getMyProfile } from "@/lib/api";
import {
  User, Trophy, MessageSquare, Clock, Calendar,
  Shield, ShieldOff, Star, Hash, Gift, Zap,
  TrendingUp, LogIn, Eye
} from "lucide-react";

interface Profile {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  kick_id: string;
  puntos: number;
  nivel: number;
  es_admin: boolean;
  es_suscriptor: boolean;
  es_baneado: boolean;
  es_muteado: boolean;
  insignia: string | null;
  fecha_follow: string | null;
  mensajes_chat: number;
  watch_time_mins: number;
  items_canjeados: number;
  sorteos_participados: number;
  created_at: string;
  last_login: string;
  login_count: number;
  rank_position: number;
  total_users: number;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

function formatWatchTime(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "32px 28px", maxWidth: "900px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[200, 120, 300].map((h, i) => (
            <div key={i} style={{ height: `${h}px`, borderRadius: "18px", background: "var(--bg2)", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: "80px 28px", textAlign: "center", color: "var(--t4)" }}>
        <User size={40} style={{ margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "20px" }}>No se pudo cargar el perfil</p>
      </div>
    );
  }

  const stats = [
    { icon: Zap,            label: "Puntos",            value: profile.puntos.toLocaleString() },
    { icon: TrendingUp,     label: "Nivel",             value: profile.nivel.toString() },
    { icon: Trophy,         label: "Ranking",           value: profile.rank_position > 0 ? `#${profile.rank_position}` : "—" },
    { icon: MessageSquare,  label: "Mensajes en chat",  value: profile.mensajes_chat.toLocaleString() },
    { icon: Clock,          label: "Watch time",        value: formatWatchTime(profile.watch_time_mins) },
    { icon: Gift,           label: "Items canjeados",   value: profile.items_canjeados.toString() },
    { icon: Star,           label: "Sorteos",           value: profile.sorteos_participados.toString() },
    { icon: LogIn,          label: "Sesiones",          value: profile.login_count.toString() },
  ];

  return (
    <div style={{ padding: "32px 28px", maxWidth: "900px" }}>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center",
          padding: "28px", borderRadius: "20px",
          background: "rgba(14,14,18,0.7)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.07)",
          marginBottom: "20px",
        }}
      >
        {/* Avatar */}
        <div style={{ position: "relative" }}>
          {profile.avatar ? (
            <Image src={profile.avatar} alt={profile.username} width={80} height={80}
              style={{ borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)" }} />
          ) : (
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <User size={32} style={{ color: "var(--t3)" }} />
            </div>
          )}
          {/* Badge */}
          {profile.insignia && (
            <div style={{
              position: "absolute", bottom: "-2px", right: "-2px",
              width: "24px", height: "24px", borderRadius: "50%",
              background: "#0e0e12", border: "2px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px",
            }}>
              {profile.insignia}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "28px", color: "#fff", lineHeight: 1 }}>
              {profile.username}
            </h1>
            {profile.es_admin && (
              <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", letterSpacing: "0.1em" }}>
                ADMIN
              </span>
            )}
            {profile.es_suscriptor && (
              <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, background: "rgba(83,252,24,0.1)", border: "1px solid rgba(83,252,24,0.25)", color: "#53FC18", letterSpacing: "0.1em" }}>
                SUB
              </span>
            )}
          </div>
          {profile.bio && (
            <p style={{ fontSize: "13px", color: "var(--t3)", marginBottom: "8px", lineHeight: 1.5 }}>{profile.bio}</p>
          )}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "var(--t4)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Hash size={11} /> {profile.kick_id}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={11} /> Registro: {formatDate(profile.created_at)}
            </span>
            {profile.rank_position > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#fff" }}>
                <Trophy size={11} /> Top #{profile.rank_position} de {profile.total_users}
              </span>
            )}
          </div>
        </div>

        {/* Points big display */}
        <div style={{
          padding: "16px 24px", borderRadius: "14px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "10px", color: "var(--t4)", fontWeight: 700, letterSpacing: "0.12em", marginBottom: "4px" }}>PUNTOS</p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "32px", color: "#fff", lineHeight: 1 }}>
            {profile.puntos.toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Status badges (ban/mute/follow) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          display: "flex", gap: "10px", flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {/* Follow date */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 16px", borderRadius: "12px",
          background: "rgba(14,14,18,0.7)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.07)",
          fontSize: "12px", color: "var(--t2)",
        }}>
          <Eye size={13} style={{ color: "var(--t3)" }} />
          <span>Follower desde: <strong style={{ color: "#fff" }}>{profile.fecha_follow ? formatDate(profile.fecha_follow) : "No disponible"}</strong></span>
        </div>

        {/* Sub status */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 16px", borderRadius: "12px",
          background: profile.es_suscriptor ? "rgba(83,252,24,0.06)" : "rgba(14,14,18,0.7)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${profile.es_suscriptor ? "rgba(83,252,24,0.2)" : "rgba(255,255,255,0.07)"}`,
          fontSize: "12px", color: profile.es_suscriptor ? "#53FC18" : "var(--t3)",
        }}>
          <Star size={13} />
          <span>{profile.es_suscriptor ? "Suscriptor activo" : "No suscrito"}</span>
        </div>

        {/* Ban status */}
        {profile.es_baneado && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 16px", borderRadius: "12px",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            fontSize: "12px", color: "#f87171",
          }}>
            <ShieldOff size={13} />
            <span>Baneado</span>
          </div>
        )}

        {/* Mute status */}
        {profile.es_muteado && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 16px", borderRadius: "12px",
            background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
            fontSize: "12px", color: "#fbbf24",
          }}>
            <Shield size={13} />
            <span>Muteado</span>
          </div>
        )}

        {/* Last login */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 16px", borderRadius: "12px",
          background: "rgba(14,14,18,0.7)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.07)",
          fontSize: "12px", color: "var(--t2)",
        }}>
          <LogIn size={13} style={{ color: "var(--t3)" }} />
          <span>Último login: <strong style={{ color: "#fff" }}>{formatDate(profile.last_login)}</strong></span>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      >
        <p className="label" style={{ marginBottom: "14px" }}>Estadísticas</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "18px 20px", borderRadius: "14px",
                background: "rgba(14,14,18,0.7)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.07)",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.background = "rgba(14,14,18,0.7)";
              }}
            >
              <s.icon size={18} style={{ color: "var(--t4)", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "20px", color: "#fff", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: "11px", color: "var(--t4)", marginTop: "3px" }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
