"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getMyProfile } from "@/lib/api";
import {
  User, Trophy, MessageSquare, Clock, Calendar,
  Shield, ShieldOff, Star, Hash, Gift, Zap,
  TrendingUp, LogIn, Eye, SmilePlus, CheckCircle, XCircle
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
  subscription_tier: string | null;
  es_baneado: boolean;
  es_muteado: boolean;
  insignia: string | null;
  fecha_follow: string | null;
  mensajes_chat: number;
  emoji_messages: number;
  watch_time_mins: number;
  items_canjeados: number;
  sorteos_participados: number;
  created_at: string;
  last_login: string;
  last_seen_at: string | null;
  login_count: number;
  rank_position: number;
  total_users: number;
  kick_badges: { text: string; type: string }[];
  kick_social_links: { platform: string; url: string }[];
  kick_is_following: boolean;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

function formatWatchTime(mins: number) {
  if (!mins) return "0m";
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
      <div style={{ padding: "32px 28px", maxWidth: "960px" }}>
        {[220, 80, 320].map((h, i) => (
          <div key={i} style={{ height: `${h}px`, borderRadius: "18px", background: "rgba(255,255,255,0.04)", marginBottom: "16px", animation: "pulse 1.5s infinite" }} />
        ))}
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

  return (
    <div style={{ padding: "32px 28px", maxWidth: "960px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Header card ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{
        display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center",
        padding: "28px", borderRadius: "20px",
        background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* Avatar */}
        <div style={{ position: "relative" }}>
          {profile.avatar ? (
            <Image src={profile.avatar} alt={profile.username} width={88} height={88}
              style={{ borderRadius: "50%", border: "2px solid rgba(255,255,255,0.12)" }} />
          ) : (
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={36} style={{ color: "var(--t3)" }} />
            </div>
          )}
          {profile.es_suscriptor && (
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: "#53FC18", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0b0b0e" }}>
              <Star size={10} style={{ color: "#000" }} />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "26px", color: "#fff", lineHeight: 1 }}>
              {profile.username}
            </h1>
            {profile.es_admin && (
              <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", letterSpacing: "0.1em" }}>ADMIN</span>
            )}
            {profile.es_suscriptor && (
              <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, background: "rgba(83,252,24,0.1)", border: "1px solid rgba(83,252,24,0.25)", color: "#53FC18", letterSpacing: "0.1em" }}>
                SUB {profile.subscription_tier ? `T${profile.subscription_tier}` : ""}
              </span>
            )}
            {profile.es_baneado && (
              <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", letterSpacing: "0.1em" }}>BANEADO</span>
            )}
            {profile.es_muteado && (
              <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", letterSpacing: "0.1em" }}>MUTEADO</span>
            )}
          </div>
          {profile.bio && <p style={{ fontSize: "13px", color: "var(--t3)", marginBottom: "8px", lineHeight: 1.5 }}>{profile.bio}</p>}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "12px", color: "var(--t4)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Hash size={11} /> ID {profile.kick_id}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={11} /> Registro: {formatDate(profile.created_at)}</span>
            {profile.rank_position > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#fff" }}>
                <Trophy size={11} /> Top #{profile.rank_position} de {profile.total_users}
              </span>
            )}
          </div>
        </div>

        {/* Puntos */}
        <div style={{ padding: "16px 24px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
          <p style={{ fontSize: "10px", color: "var(--t4)", fontWeight: 700, letterSpacing: "0.12em", marginBottom: "4px" }}>PUNTOS</p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "34px", color: "#fff", lineHeight: 1 }}>{profile.puntos.toLocaleString()}</p>
          {profile.rank_position > 0 && (
            <p style={{ fontSize: "11px", color: "var(--t4)", marginTop: "4px" }}>#{profile.rank_position} en ranking</p>
          )}
        </div>
      </motion.div>

      {/* ── Kick badges ── */}
      {profile.kick_badges && profile.kick_badges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{
          padding: "18px 20px", borderRadius: "16px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <p style={{ fontSize: "11px", color: "var(--t4)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "12px" }}>INSIGNIAS DE KICK</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {profile.kick_badges.map((badge, i) => (
              <span key={i} style={{
                padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--t2)"
              }}>
                {badge.text || badge.type}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Estado en el canal ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px",
      }}>
        {/* Follow */}
        <StatusCard
          icon={<Eye size={14} style={{ color: profile.kick_is_following ? "#53FC18" : "var(--t4)" }} />}
          label="Sigue a Brunenger"
          value={profile.kick_is_following ? "Sí" : "No"}
          sub={profile.fecha_follow ? `desde ${formatDate(profile.fecha_follow)}` : undefined}
          ok={profile.kick_is_following}
        />

        {/* Sub */}
        <StatusCard
          icon={<Star size={14} style={{ color: profile.es_suscriptor ? "#53FC18" : "var(--t4)" }} />}
          label="Suscriptor"
          value={profile.es_suscriptor ? `Sí${profile.subscription_tier ? ` · Tier ${profile.subscription_tier}` : ""}` : "No"}
          ok={profile.es_suscriptor}
        />

        {/* Ban */}
        <StatusCard
          icon={profile.es_baneado ? <ShieldOff size={14} style={{ color: "#f87171" }} /> : <Shield size={14} style={{ color: "var(--t4)" }} />}
          label="Estado de ban"
          value={profile.es_baneado ? "Baneado" : "Sin ban"}
          ok={!profile.es_baneado}
        />

        {/* Mute */}
        <StatusCard
          icon={profile.es_muteado
            ? <XCircle size={14} style={{ color: "#fbbf24" }} />
            : <CheckCircle size={14} style={{ color: "var(--t4)" }} />}
          label="Estado de mute"
          value={profile.es_muteado ? "Muteado" : "Sin mute"}
          ok={!profile.es_muteado}
        />

        {/* Último login */}
        <StatusCard
          icon={<LogIn size={14} style={{ color: "var(--t4)" }} />}
          label="Último inicio de sesión"
          value={formatDate(profile.last_login)}
          ok={null}
        />

        {/* Visto por última vez */}
        {profile.last_seen_at && (
          <StatusCard
            icon={<Clock size={14} style={{ color: "var(--t4)" }} />}
            label="Último mensaje en chat"
            value={formatDate(profile.last_seen_at)}
            ok={null}
          />
        )}
      </motion.div>

      {/* ── Estadísticas ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <p style={{ fontSize: "11px", color: "var(--t4)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "12px" }}>ESTADÍSTICAS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "10px" }}>
          {[
            { icon: Zap,           label: "Puntos",              value: profile.puntos.toLocaleString() },
            { icon: TrendingUp,    label: "Nivel",               value: String(profile.nivel) },
            { icon: Trophy,        label: "Ranking",             value: profile.rank_position > 0 ? `#${profile.rank_position}` : "—" },
            { icon: MessageSquare, label: "Mensajes en chat",    value: (profile.mensajes_chat || 0).toLocaleString() },
            { icon: SmilePlus,     label: "Mensajes con emojis", value: (profile.emoji_messages || 0).toLocaleString() },
            { icon: Clock,         label: "Watch time",          value: formatWatchTime(profile.watch_time_mins) },
            { icon: Gift,          label: "Items canjeados",     value: String(profile.items_canjeados || 0) },
            { icon: Star,          label: "Sorteos",             value: String(profile.sorteos_participados || 0) },
            { icon: LogIn,         label: "Sesiones",            value: String(profile.login_count || 1) },
          ].map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.03 }}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "16px 18px", borderRadius: "14px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
              }}
            >
              <s.icon size={16} style={{ color: "var(--t4)", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "20px", color: "#fff", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "11px", color: "var(--t4)", marginTop: "3px" }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Social links ── */}
      {profile.kick_social_links && profile.kick_social_links.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{
          padding: "18px 20px", borderRadius: "16px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <p style={{ fontSize: "11px", color: "var(--t4)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "12px" }}>REDES SOCIALES</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {profile.kick_social_links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--t2)", textDecoration: "none",
                transition: "color 0.15s, border-color 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--t2)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                {link.platform}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatusCard({ icon, label, value, sub, ok }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  ok: boolean | null;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "14px 16px", borderRadius: "14px",
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "11px", color: "var(--t4)", marginBottom: "2px" }}>{label}</p>
        <p style={{
          fontSize: "13px", fontWeight: 700,
          color: ok === true ? "#53FC18" : ok === false ? "#f87171" : "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{value}</p>
        {sub && <p style={{ fontSize: "11px", color: "var(--t4)", marginTop: "1px" }}>{sub}</p>}
      </div>
    </div>
  );
}
