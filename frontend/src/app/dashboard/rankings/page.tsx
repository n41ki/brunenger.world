"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getRankings } from "@/lib/api";
import { Trophy, Clock, MessageSquare, Heart, Crown } from "lucide-react";

interface RankUser { id: string; username: string; avatar: string; puntos: number; nivel: number; watch_time?: number; chat_messages?: number }
interface Rankings { topViewers: RankUser[]; topChatters: RankUser[]; topSupporters: RankUser[] }

function RankRow({ user, rank }: { user: RankUser; rank: number }) {
  const isTop3 = rank < 3;
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-xl transition-colors
        ${isTop3 ? "bg-[#161616] border border-white/8" : "hover:bg-[#111]"}`}
    >
      <div className="w-7 text-center">
        {isTop3
          ? <span className="text-lg">{medals[rank]}</span>
          : <span className="font-display text-sm text-[#333] tracking-widest">{rank + 1}</span>
        }
      </div>
      <div className="relative w-9 h-9 flex-shrink-0">
        {user.avatar
          ? <Image src={user.avatar} alt={user.username} fill className="rounded-full object-cover" />
          : <div className="w-full h-full rounded-full bg-[#2a2a2a] flex items-center justify-center font-body font-bold text-sm text-[#555]">{user.username[0]?.toUpperCase()}</div>
        }
        {rank === 0 && <Crown size={12} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[#C9A84C]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-sm text-white truncate">{user.username}</p>
        <p className="text-xs font-body text-[#444]">Nivel {user.nivel}</p>
      </div>
      <div className="text-right">
        <p className={`font-display text-lg tracking-widest ${isTop3 ? "text-[#FF6B00]" : "text-[#555]"}`}>
          {user.puntos?.toLocaleString()}
        </p>
        <p className="text-[10px] font-body text-[#333]">puntos</p>
      </div>
    </motion.div>
  );
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Rankings>({ topViewers: [], topChatters: [], topSupporters: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"viewers" | "chatters" | "supporters">("viewers");

  useEffect(() => {
    getRankings().then((r) => setRankings(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: "viewers"    as const, label: "Viewers",    icon: Clock },
    { id: "chatters"   as const, label: "Chatters",   icon: MessageSquare },
    { id: "supporters" as const, label: "Supporters", icon: Heart },
  ];

  const data = tab === "viewers" ? rankings.topViewers : tab === "chatters" ? rankings.topChatters : rankings.topSupporters;

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Trophy size={20} className="text-[#C9A84C]" />
          <h1 className="font-display text-4xl tracking-widest text-white">RANKINGS</h1>
        </div>
        <p className="font-body text-sm text-[#555]">Los mejores de la comunidad Brunenger</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#111] rounded-xl border border-white/5 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${
              tab === t.id ? "bg-[#1C1C1C] text-white" : "text-[#444] hover:text-[#888]"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-1">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-[#111] animate-pulse" />
            ))
          : data.length === 0
            ? <div className="flex flex-col items-center justify-center py-16 text-[#333]">
                <Trophy size={32} className="mb-3" />
                <p className="font-display text-xl tracking-widest">SIN DATOS</p>
              </div>
            : data.map((u, i) => <RankRow key={u.id} user={u} rank={i} />)
        }
      </div>
    </div>
  );
}
