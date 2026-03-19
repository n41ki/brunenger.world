"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getRankings } from "@/lib/api";
import { Trophy, Clock, MessageSquare, Heart } from "lucide-react";

interface RankUser { id: string; username: string; avatar: string; puntos: number; nivel: number }
interface Rankings { topViewers: RankUser[]; topChatters: RankUser[]; topSupporters: RankUser[] }

const MEDALS = ["🥇", "🥈", "🥉"];

function Row({ user, rank }: { user: RankUser; rank: number }) {
  const top = rank < 3;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: rank * 0.03 }}
      className="rank-row" style={{ background: top ? "var(--glass-bg)" : undefined, border: top ? "1px solid var(--glass-border)" : undefined }}>
      <span style={{ width: "24px", textAlign: "center", flexShrink: 0 }}>
        {top
          ? <span style={{ fontSize: "16px" }}>{MEDALS[rank]}</span>
          : <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--t4)" }}>{rank + 1}</span>
        }
      </span>
      <div style={{ position: "relative", width: "32px", height: "32px", flexShrink: 0 }}>
        {user.avatar
          ? <Image src={user.avatar} alt={user.username} fill style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)" }} />
          : <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--t4)" }}>
              {user.username[0]?.toUpperCase()}
            </div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.username}</p>
        <p style={{ fontSize: "11px", color: "var(--t4)" }}>Nivel {user.nivel}</p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "15px", color: top ? "var(--orange)" : "var(--t3)" }}>
          {user.puntos?.toLocaleString()}
        </p>
        <p style={{ fontSize: "10px", color: "var(--t4)" }}>pts</p>
      </div>
    </motion.div>
  );
}

export default function RankingsPage() {
  const [data,    setData]    = useState<Rankings>({ topViewers: [], topChatters: [], topSupporters: [] });
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"viewers"|"chatters"|"supporters">("viewers");

  useEffect(() => {
    getRankings().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const TABS = [
    { id: "viewers"    as const, label: "Viewers",    icon: Clock         },
    { id: "chatters"   as const, label: "Chatters",   icon: MessageSquare },
    { id: "supporters" as const, label: "Supporters", icon: Heart         },
  ];

  const rows = tab === "viewers" ? data.topViewers : tab === "chatters" ? data.topChatters : data.topSupporters;

  return (
    <div style={{ padding: "32px 28px", maxWidth: "680px" }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <Trophy size={20} style={{ color: "var(--orange)" }} />
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "32px", color: "var(--t1)", lineHeight: 1 }}>
            Rankings
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "var(--t3)" }}>Los mejores de la comunidad Brunenger</p>
      </motion.div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: "16px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`tab${tab === t.id ? " active" : ""}`}>
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: "56px", borderRadius: "12px", background: "var(--bg2)", animation: "pulse 1.5s infinite" }} />
            ))
          : rows.length === 0
            ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", color: "var(--t4)", gap: "12px" }}>
                <Trophy size={28} />
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px" }}>Sin datos</p>
              </div>
            : rows.map((u, i) => <Row key={u.id} user={u} rank={i} />)
        }
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
