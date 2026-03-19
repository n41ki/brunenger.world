"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { getGiveaways, joinGiveaway } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/auth";
import { Gift, Users, Trophy, Zap, CheckCircle, Sparkles } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface Participant { id: string; username: string; avatar: string }
interface Giveaway {
  id: string;
  premio: string;
  descripcion?: string;
  imagen?: string;
  estado: "activo" | "finalizado" | "pendiente";
  participantes: Participant[];
  ganador?: Participant;
}
interface User { id: string; username: string }

export default function GiveawaysPage() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [winner, setWinner] = useState<{ giveaway: string; user: Participant } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const loadGiveaways = useCallback(() => {
    getGiveaways()
      .then((r) => setGiveaways(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
    loadGiveaways();

    // Socket.IO for real-time winner announcement
    const s = io(BACKEND_URL);
    setSocket(s);

    s.on("giveaway:winner", (data: { giveawayId: string; winner: Participant; prize: string }) => {
      setWinner({ giveaway: data.prize, user: data.winner });
      setGiveaways((prev) =>
        prev.map((g) =>
          g.id === data.giveawayId ? { ...g, estado: "finalizado", ganador: data.winner } : g
        )
      );
      setTimeout(() => setWinner(null), 8000);
    });

    s.on("giveaway:update", () => loadGiveaways());

    return () => { s.disconnect(); };
  }, [loadGiveaways]);

  const handleJoin = async (giveawayId: string) => {
    setJoining(giveawayId);
    try {
      await joinGiveaway(giveawayId);
      loadGiveaways();
    } catch {}
    finally { setJoining(null); }
  };

  const isParticipating = (giveaway: Giveaway) =>
    user && giveaway.participantes.some((p) => p.id === user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-white mb-2">
          <span className="text-gradient-red-blue">SORTEOS</span>
        </h1>
        <p className="text-white/50 font-rajdhani text-lg">Participa y gana premios increíbles</p>
      </motion.div>

      {/* Winner announcement overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setWinner(null)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative bg-gradient-to-br from-yellow-500/20 to-red-500/20 border-2 border-yellow-500/60 rounded-3xl p-10 text-center max-w-md mx-4"
              style={{ boxShadow: "0 0 60px rgba(255,215,0,0.4), 0 0 120px rgba(255,215,0,0.2)" }}
            >
              {/* Sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400"
                  style={{
                    top: `${10 + i * 15}%`,
                    left: i % 2 === 0 ? `${5 + i * 5}%` : `${75 + i * 3}%`,
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <Sparkles size={20} />
                </motion.div>
              ))}

              <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
              <h2 className="font-orbitron font-black text-2xl text-yellow-400 mb-2">¡GANADOR!</h2>
              <p className="text-white/60 text-sm mb-4 font-rajdhani">Premio: <span className="text-white font-bold">{winner.giveaway}</span></p>
              {winner.user.avatar && (
                <Image
                  src={winner.user.avatar}
                  alt={winner.user.username}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-3 border-4 border-yellow-500"
                />
              )}
              <p className="font-orbitron font-black text-3xl text-white">{winner.user.username}</p>
              <p className="text-white/40 text-sm mt-2 font-rajdhani">¡Felicitaciones!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Giveaways grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : giveaways.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-white/40"
        >
          <Gift size={48} />
          <p className="font-orbitron text-xl">No hay sorteos activos</p>
          <p className="font-rajdhani">¡Vuelve pronto para participar!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {giveaways.map((giveaway, i) => (
            <motion.div
              key={giveaway.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border overflow-hidden ${
                giveaway.estado === "activo"
                  ? "border-red-500/40 bg-gradient-to-br from-red-500/10 to-[#0d0d1a]"
                  : "border-white/10 bg-[#0d0d1a] opacity-70"
              }`}
            >
              {/* Prize header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {giveaway.estado === "activo" ? (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full text-red-400 text-xs font-orbitron font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          ACTIVO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-white/40 text-xs font-orbitron">
                          FINALIZADO
                        </span>
                      )}
                    </div>
                    <h3 className="font-orbitron font-black text-xl text-white">{giveaway.premio}</h3>
                    {giveaway.descripcion && (
                      <p className="text-white/50 text-sm mt-1 font-rajdhani">{giveaway.descripcion}</p>
                    )}
                  </div>
                  <Gift size={32} className={giveaway.estado === "activo" ? "text-red-400" : "text-white/30"} />
                </div>

                {/* Participants */}
                <div className="flex items-center gap-2 mb-4">
                  <Users size={14} className="text-white/40" />
                  <span className="text-white/40 text-sm font-rajdhani">
                    {giveaway.participantes.length} participante{giveaway.participantes.length !== 1 ? "s" : ""}
                  </span>
                  {/* Avatar stack */}
                  <div className="flex -space-x-2 ml-1">
                    {giveaway.participantes.slice(0, 5).map((p) => (
                      <div key={p.id} className="w-6 h-6 rounded-full border border-[#0d0d1a] bg-blue-500/30 overflow-hidden">
                        {p.avatar && <Image src={p.avatar} alt={p.username} width={24} height={24} />}
                      </div>
                    ))}
                    {giveaway.participantes.length > 5 && (
                      <div className="w-6 h-6 rounded-full border border-[#0d0d1a] bg-white/20 flex items-center justify-center text-[10px] text-white/60">
                        +{giveaway.participantes.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* Winner or Join button */}
                {giveaway.estado === "finalizado" && giveaway.ganador ? (
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <Trophy size={16} className="text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm font-orbitron">
                      Ganador: {giveaway.ganador.username}
                    </span>
                  </div>
                ) : giveaway.estado === "activo" ? (
                  isParticipating(giveaway) ? (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-bold text-sm font-orbitron">
                      <CheckCircle size={16} />
                      ¡YA ESTÁS PARTICIPANDO!
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => handleJoin(giveaway.id)}
                      disabled={joining === giveaway.id}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-orbitron font-black text-sm rounded-xl hover:from-red-500 hover:to-red-400 transition-all"
                      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255,0,51,0.4)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {joining === giveaway.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          UNIÉNDOSE...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Zap size={16} />
                          PARTICIPAR
                        </span>
                      )}
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
