"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getRankings } from "@/lib/api";
import { Trophy, Clock, MessageSquare, Heart, Crown, Medal } from "lucide-react";

interface RankUser {
  id: string;
  username: string;
  avatar: string;
  puntos: number;
  nivel: number;
  watch_time?: number;
  chat_messages?: number;
  donations?: number;
}

interface Rankings {
  topViewers: RankUser[];
  topChatters: RankUser[];
  topSupporters: RankUser[];
}

const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];
const RANK_ICONS = [Crown, Medal, Medal];
const RANK_GLOW = [
  "shadow-[0_0_20px_rgba(255,215,0,0.3)] border-yellow-500/40",
  "shadow-[0_0_20px_rgba(192,192,192,0.2)] border-gray-400/30",
  "shadow-[0_0_20px_rgba(180,83,9,0.2)] border-amber-600/30",
];

function RankCard({ user, rank }: { user: RankUser; rank: number }) {
  const RIcon = rank < 3 ? RANK_ICONS[rank] : null;
  const color = rank < 3 ? RANK_COLORS[rank] : "text-white/50";
  const glow = rank < 3 ? RANK_GLOW[rank] : "border-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`flex items-center gap-4 p-4 rounded-xl border bg-white/5 ${glow} transition-all hover:bg-white/8`}
    >
      <div className={`w-8 text-center font-orbitron font-black text-lg ${color}`}>
        {RIcon ? <RIcon size={20} className="mx-auto" /> : rank + 1}
      </div>
      <div className="relative">
        {user.avatar ? (
          <Image src={user.avatar} alt={user.username} width={40} height={40} className="rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center font-bold text-blue-400">
            {user.username[0]?.toUpperCase()}
          </div>
        )}
        {rank === 0 && (
          <span className="absolute -top-1 -right-1 text-xs">👑</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{user.username}</p>
        <p className="text-white/40 text-xs">Nivel {user.nivel}</p>
      </div>
      <div className="text-right">
        <p className={`font-orbitron font-bold text-sm ${color}`}>{user.puntos?.toLocaleString()}</p>
        <p className="text-white/30 text-xs">puntos</p>
      </div>
    </motion.div>
  );
}

function RankingSection({
  title,
  icon: Icon,
  color,
  users,
  stat,
  statLabel,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  users: RankUser[];
  stat: keyof RankUser;
  statLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-white/5`}>
          <Icon size={20} className={color} />
        </div>
        <h2 className={`font-orbitron font-bold text-xl ${color}`}>{title}</h2>
      </div>
      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-white/30 text-center py-6 font-rajdhani">Sin datos aún</p>
        ) : (
          users.slice(0, 10).map((user, i) => (
            <RankCard key={user.id} user={user} rank={i} />
          ))
        )}
      </div>
    </motion.div>
  );
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Rankings>({
    topViewers: [],
    topChatters: [],
    topSupporters: [],
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"viewers" | "chatters" | "supporters">("viewers");

  useEffect(() => {
    getRankings()
      .then((r) => setRankings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: "viewers" as const, label: "Top Viewers", icon: Clock, color: "text-blue-400" },
    { id: "chatters" as const, label: "Top Chatters", icon: MessageSquare, color: "text-green-400" },
    { id: "supporters" as const, label: "Top Supporters", icon: Heart, color: "text-red-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-white mb-2">
          <span className="text-gradient-full">RANKINGS</span>
        </h1>
        <p className="text-white/50 font-rajdhani text-lg">Los mejores de la comunidad Brunenger</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-orbitron font-bold text-sm border transition-all ${
              tab === t.id
                ? `${t.color} bg-white/10 border-current`
                : "text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <t.icon size={16} />
            {t.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {tab === "viewers" && (
            <RankingSection
              title="Top Viewers"
              icon={Clock}
              color="text-blue-400"
              users={rankings.topViewers}
              stat="watch_time"
              statLabel="horas vistas"
            />
          )}
          {tab === "chatters" && (
            <RankingSection
              title="Top Chatters"
              icon={MessageSquare}
              color="text-green-400"
              users={rankings.topChatters}
              stat="chat_messages"
              statLabel="mensajes"
            />
          )}
          {tab === "supporters" && (
            <RankingSection
              title="Top Supporters"
              icon={Heart}
              color="text-red-400"
              users={rankings.topSupporters}
              stat="donations"
              statLabel="donaciones"
            />
          )}
        </motion.div>
      )}
    </div>
  );
}
