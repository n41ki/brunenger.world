"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { getGiveaways, joinGiveaway } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/auth";
import { Gift, Users, Trophy, Zap, Check } from "lucide-react";
import LightningIcon from "@/components/ui/LightningIcon";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface Participant { id: string; username: string; avatar: string }
interface Giveaway { id: string; premio: string; descripcion?: string; estado: "activo" | "finalizado" | "pendiente"; participantes: Participant[]; ganador?: Participant }
interface User { id: string }

export default function GiveawaysPage() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [winner, setWinner]  = useState<{ prize: string; user: Participant } | null>(null);
  const [, setSocket] = useState<Socket | null>(null);

  const load = useCallback(() => {
    getGiveaways().then((r) => setGiveaways(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
    load();
    const s = io(BACKEND_URL);
    setSocket(s);
    s.on("giveaway:winner", (d: { winner: Participant; prize: string }) => {
      setWinner({ prize: d.prize, user: d.winner });
      setTimeout(() => setWinner(null), 8000);
    });
    s.on("giveaway:update", load);
    return () => { s.disconnect(); };
  }, [load]);

  const handleJoin = async (id: string) => {
    setJoining(id);
    try { await joinGiveaway(id); load(); } catch {} finally { setJoining(null); }
  };

  const isIn = (g: Giveaway) => user && g.participantes.some((p) => p.id === user.id);

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Gift size={20} className="text-[#FF6B00]" />
          <h1 className="font-display text-4xl tracking-widest text-white">SORTEOS</h1>
        </div>
        <p className="font-body text-sm text-[#555]">Participa y gana premios exclusivos</p>
      </motion.div>

      {/* Winner overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
            onClick={() => setWinner(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 180 }}
              className="bg-[#111] border border-[#FF6B00]/40 rounded-3xl p-10 text-center max-w-sm mx-4 shadow-[0_0_60px_rgba(255,107,0,0.2)]"
            >
              <div className="flex justify-center mb-4 lightning-glow">
                <LightningIcon size={36} />
              </div>
              <p className="font-body text-xs text-[#555] tracking-widest uppercase mb-1">Premio</p>
              <p className="font-body font-semibold text-[#FF6B00] mb-6">{winner.prize}</p>
              {winner.user.avatar && (
                <Image src={winner.user.avatar} alt={winner.user.username} width={72} height={72}
                  className="rounded-full mx-auto mb-4 border-2 border-[#FF6B00]/50" />
              )}
              <p className="font-display text-3xl tracking-widest text-white">{winner.user.username}</p>
              <p className="font-body text-xs text-[#444] mt-2">¡Felicitaciones!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Giveaways */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-48 rounded-2xl bg-[#111] animate-pulse" />)}
        </div>
      ) : giveaways.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#333]">
          <Gift size={40} />
          <p className="font-display text-2xl tracking-widest">SIN SORTEOS</p>
          <p className="font-body text-sm">¡Vuelve pronto para participar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {giveaways.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border overflow-hidden transition-all ${
                g.estado === "activo"
                  ? "bg-[#111] border-[#FF6B00]/25"
                  : "bg-[#0E0E0E] border-white/5 opacity-60"
              }`}
            >
              <div className="p-6">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {g.estado === "activo" ? (
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] live-dot" />
                          <span className="text-[10px] font-body font-bold text-[#FF6B00] tracking-widest">ACTIVO</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-body text-[#333] tracking-widest bg-white/5 px-2.5 py-1 rounded-full">FINALIZADO</span>
                      )}
                    </div>
                    <h3 className="font-display text-2xl tracking-widest text-white">{g.premio}</h3>
                    {g.descripcion && <p className="font-body text-sm text-[#555] mt-1">{g.descripcion}</p>}
                  </div>
                  <Gift size={24} className={g.estado === "activo" ? "text-[#FF6B00]" : "text-[#333]"} />
                </div>

                {/* Participants */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex -space-x-2">
                    {g.participantes.slice(0, 6).map((p) => (
                      <div key={p.id} className="w-7 h-7 rounded-full border-2 border-[#111] bg-[#2a2a2a] overflow-hidden">
                        {p.avatar && <Image src={p.avatar} alt={p.username} width={28} height={28} />}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-body text-[#444]">
                    <Users size={12} />
                    <span>{g.participantes.length} participantes</span>
                  </div>
                </div>

                {/* Action */}
                {g.estado === "finalizado" && g.ganador ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161616] border border-[#C9A84C]/20">
                    <Trophy size={14} className="text-[#C9A84C]" />
                    <span className="font-body text-sm text-[#C9A84C] font-medium">Ganador: {g.ganador.username}</span>
                  </div>
                ) : g.estado === "activo" ? (
                  isIn(g) ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[#161616] border border-white/8 text-sm font-body text-[#888]">
                      <Check size={14} className="text-[#FF6B00]" />
                      Ya estás participando
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => handleJoin(g.id)}
                      disabled={joining === g.id}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-primary font-body font-semibold text-sm"
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    >
                      {joining === g.id
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Zap size={14} /> Participar</>
                      }
                    </motion.button>
                  )
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
