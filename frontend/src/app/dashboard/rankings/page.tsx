"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getRankings } from "@/lib/api";
import { Trophy, Clock, MessageSquare, Search } from "lucide-react";

interface RankUser { id: string; username: string; avatar: string; puntos: number; nivel: number }
interface Rankings { topViewers: RankUser[]; topChatters: RankUser[]; topSupporters: RankUser[] }

const POS_ICON: Record<number, string> = { 0: "👑", 1: "🥈", 2: "🥉" };

export default function RankingsPage() {
  const [data,    setData]    = useState<Rankings>({ topViewers: [], topChatters: [], topSupporters: [] });
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"viewers"|"chatters"|"supporters">("viewers");
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    getRankings().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const TABS = [
    { id: "viewers"    as const, label: "Viewers",    icon: Clock          },
    { id: "chatters"   as const, label: "Chatters",   icon: MessageSquare  },
    { id: "supporters" as const, label: "Supporters", icon: Trophy         },
  ];

  const allRows = tab === "viewers" ? data.topViewers : tab === "chatters" ? data.topChatters : data.topSupporters;
  const rows = search ? allRows.filter(u => u.username.toLowerCase().includes(search.toLowerCase())) : allRows;

  const colLabel = tab === "viewers" ? "Watch time (pts)" : tab === "chatters" ? "Mensajes (pts)" : "Puntos";

  return (
    <div style={{ padding: "32px 28px", maxWidth: "960px" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "28px" }}>
        <p className="label" style={{ marginBottom: "6px" }}>Comunidad</p>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "32px", color: "var(--t1)", lineHeight: 1 }}>
          Rankings
        </h1>
      </motion.div>

      {/* Platform tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 18px", borderRadius: "999px",
              fontWeight: 600, fontSize: "13px", cursor: "pointer",
              background: tab === t.id ? "var(--orange)" : "var(--bg2)",
              color: tab === t.id ? "#fff" : "var(--t3)",
              border: tab === t.id ? "none" : "1px solid var(--border)",
              boxShadow: tab === t.id ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
              transition: "all 0.18s ease",
            }}>
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: "var(--bg1)", border: "1px solid var(--glass-border)", borderRadius: "16px", overflow: "hidden" }}>
        {/* Search bar inside card */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--glass-border)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, maxWidth: "280px", position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--t4)" }} />
            <input className="input" placeholder="Buscar usuario..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: "32px", height: "34px", fontSize: "12px" }} />
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "48px 1fr 120px",
          padding: "10px 20px", borderBottom: "1px solid var(--glass-border)",
          fontSize: "11px", fontWeight: 700, color: "var(--t4)", letterSpacing: "0.1em", textTransform: "uppercase"
        }}>
          <span>#</span>
          <span>Usuario</span>
          <span style={{ textAlign: "right" }}>{colLabel}</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: "20px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: "48px", borderRadius: "8px", background: "var(--bg2)", marginBottom: "6px", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--t4)" }}>
            <Trophy size={28} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "16px" }}>Sin datos</p>
          </div>
        ) : (
          <div>
            {rows.map((u, i) => {
              const isTop = i < 3;
              return (
                <motion.div key={u.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
                  style={{
                    display: "grid", gridTemplateColumns: "48px 1fr 120px",
                    padding: "12px 20px", alignItems: "center",
                    borderBottom: "1px solid var(--glass-border)",
                    background: isTop ? "var(--glass-bg)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--glass-bg)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isTop ? "var(--glass-bg)" : "transparent"}
                >
                  {/* Position */}
                  <span style={{ textAlign: "center", fontSize: isTop ? "16px" : "13px", fontWeight: 700, color: isTop ? "var(--orange)" : "var(--t4)" }}>
                    {POS_ICON[i] ?? i + 1}
                  </span>

                  {/* User */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "var(--bg3)", border: "1px solid var(--border)" }}>
                      {u.avatar
                        ? <Image src={u.avatar} alt={u.username} width={32} height={32} style={{ objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--t4)" }}>{u.username[0]?.toUpperCase()}</div>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: isTop ? "var(--t1)" : "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.username}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--t4)" }}>Nivel {u.nivel}</p>
                    </div>
                  </div>

                  {/* Points */}
                  <p style={{ textAlign: "right", fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "14px", color: isTop ? "var(--orange)" : "var(--t3)" }}>
                    {u.puntos?.toLocaleString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
