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
      className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-colors hover:bg-[#161616] ${top ? "bg-[#161616]" : ""}`}>
      <span className="w-6 text-center">
        {top
          ? <span className="text-base">{MEDALS[rank]}</span>
          : <span className="display text-[13px] tracking-widest text-[#2A2A2A]">{rank + 1}</span>
        }
      </span>
      <div className="relative w-8 h-8 flex-shrink-0">
        {user.avatar
          ? <Image src={user.avatar} alt={user.username} fill className="rounded-full object-cover border border-[rgba(255,255,255,0.06)]" />
          : <div className="w-full h-full rounded-full bg-[#1E1E1E] flex items-center justify-center text-[12px] font-bold text-[#444]">{user.username[0]?.toUpperCase()}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white truncate">{user.username}</p>
        <p className="text-[11px] text-[#333]">Nivel {user.nivel}</p>
      </div>
      <div className="text-right">
        <p className={`display text-[16px] tracking-widest ${top ? "accent" : "text-[#333]"}`}>{user.puntos?.toLocaleString()}</p>
        <p className="text-[10px] text-[#2A2A2A]">pts</p>
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
    { id: "viewers"    as const, label: "Viewers",    icon: Clock        },
    { id: "chatters"   as const, label: "Chatters",   icon: MessageSquare},
    { id: "supporters" as const, label: "Supporters", icon: Heart        },
  ];

  const rows = tab === "viewers" ? data.topViewers : tab === "chatters" ? data.topChatters : data.topSupporters;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Trophy size={18} className="accent" />
          <h1 className="display text-[36px] tracking-widest text-white">RANKINGS</h1>
        </div>
        <p className="text-[13px] text-[#444]">Los mejores de la comunidad Brunenger</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#111] rounded-xl border border-[rgba(255,255,255,0.07)] mb-5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              tab === t.id ? "bg-[#1E1E1E] text-white" : "text-[#444] hover:text-[#777]"
            }`}>
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-1">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-[#111] animate-pulse" />)
          : rows.length === 0
            ? <div className="flex flex-col items-center py-16 text-[#2A2A2A] gap-3">
                <Trophy size={28} />
                <p className="display text-[18px] tracking-widest">SIN DATOS</p>
              </div>
            : rows.map((u, i) => <Row key={u.id} user={u} rank={i} />)
        }
      </div>
    </div>
  );
}
