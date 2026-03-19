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

interface P { id: string; username: string; avatar: string }
interface Giveaway { id: string; premio: string; descripcion?: string; estado: "activo"|"finalizado"|"pendiente"; participantes: P[]; ganador?: P }
interface User { id: string }

export default function GiveawaysPage() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [user,      setUser]      = useState<User | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [joining,   setJoining]   = useState<string | null>(null);
  const [winner,    setWinner]    = useState<{ prize: string; user: P } | null>(null);
  const [,          setSocket]    = useState<Socket | null>(null);

  const load = useCallback(() => {
    getGiveaways().then(r => setGiveaways(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
    load();
    const s = io(BACKEND_URL);
    setSocket(s);
    s.on("giveaway:winner", (d: { winner: P; prize: string }) => {
      setWinner({ prize: d.prize, user: d.winner });
      setTimeout(() => setWinner(null), 8000);
    });
    s.on("giveaway:update", load);
    return () => { s.disconnect(); };
  }, [load]);

  const join = async (id: string) => {
    setJoining(id);
    try { await joinGiveaway(id); load(); } catch {} finally { setJoining(null); }
  };

  const isIn = (g: Giveaway) => user && g.participantes.some(p => p.id === user.id);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Gift size={18} className="accent" />
          <h1 className="display text-[36px] tracking-widest text-white">SORTEOS</h1>
        </div>
        <p className="text-[13px] text-[#444]">Participa y gana premios exclusivos</p>
      </motion.div>

      {/* Winner overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setWinner(null)}>
            <motion.div initial={{ scale: 0.85, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 160 }}
              className="card glow-box rounded-2xl px-10 py-10 text-center max-w-xs mx-4">
              <span className="bolt inline-block mb-4"><LightningIcon size={32} /></span>
              <p className="label mb-1">Premio</p>
              <p className="text-[13px] font-semibold accent mb-5">{winner.prize}</p>
              {winner.user.avatar && (
                <Image src={winner.user.avatar} alt={winner.user.username} width={64} height={64}
                  className="rounded-full mx-auto mb-3 border-2 border-[rgba(249,115,22,0.4)]" />
              )}
              <p className="display text-[28px] tracking-widest text-white">{winner.user.username}</p>
              <p className="text-[11px] text-[#333] mt-2">¡Felicitaciones!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-44 rounded-xl bg-[#111] animate-pulse" />)}
        </div>
      ) : giveaways.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4 text-[#2A2A2A]">
          <Gift size={36} />
          <p className="display text-[20px] tracking-widest">SIN SORTEOS</p>
          <p className="text-[13px]">¡Vuelve pronto!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {giveaways.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`card p-6 ${g.estado !== "activo" ? "opacity-50" : ""}`}
              style={g.estado === "activo" ? { borderColor: "rgba(249,115,22,0.2)" } : {}}>

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {g.estado === "activo"
                      ? <div className="flex items-center gap-2 px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                          <span className="live-dot" style={{ width: "5px", height: "5px" }} />
                          <span className="text-[10px] font-bold tracking-widest accent">ACTIVO</span>
                        </div>
                      : <span className="text-[10px] text-[#333] tracking-widest bg-[#161616] px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.07)]">FINALIZADO</span>
                    }
                  </div>
                  <h3 className="display text-[22px] tracking-widest text-white">{g.premio}</h3>
                  {g.descripcion && <p className="text-[12px] text-[#444] mt-1">{g.descripcion}</p>}
                </div>
                <Gift size={20} className={g.estado === "activo" ? "accent" : "text-[#2A2A2A]"} />
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex -space-x-2">
                  {g.participantes.slice(0, 5).map(p => (
                    <div key={p.id} className="w-6 h-6 rounded-full border-2 border-[#111] bg-[#1E1E1E] overflow-hidden">
                      {p.avatar && <Image src={p.avatar} alt={p.username} width={24} height={24} />}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#333]">
                  <Users size={11} />
                  {g.participantes.length} participantes
                </div>
              </div>

              {g.estado === "finalizado" && g.ganador ? (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#161616] border border-[rgba(255,255,255,0.07)]">
                  <Trophy size={13} className="text-[#444]" />
                  <span className="text-[12px] text-[#555] font-medium">Ganador: {g.ganador.username}</span>
                </div>
              ) : g.estado === "activo" ? (
                isIn(g) ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#161616] border border-[rgba(255,255,255,0.07)] text-[12px] text-[#555]">
                    <Check size={12} className="accent" /> Ya estás participando
                  </div>
                ) : (
                  <button onClick={() => join(g.id)} disabled={joining === g.id}
                    className="btn btn-orange w-full text-[13px]">
                    {joining === g.id
                      ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      : <><Zap size={13} /> Participar</>
                    }
                  </button>
                )
              ) : null}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
