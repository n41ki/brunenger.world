"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { io, Socket } from "socket.io-client";
import { getGiveaways, joinGiveaway } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/auth";
import { Gift, Users, Trophy, Zap, Check } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface P { id: string; username: string; avatar: string }
interface Giveaway {
  id: string; premio: string; descripcion?: string; imagen?: string;
  estado: "activo" | "finalizado" | "pendiente";
  participantes: P[]; ganador?: P
}
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
    try { await joinGiveaway(id); load(); } catch { /* ignore */ } finally { setJoining(null); }
  };

  const isIn = (g: Giveaway) => user && g.participantes.some(p => p.id === user.id);

  return (
    <div style={{ padding: "32px 28px", maxWidth: "1200px" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "36px", color: "#fff", marginBottom: "8px" }}>
          Sorteos
        </h1>
        <p style={{ fontSize: "14px", color: "var(--t3)", maxWidth: "460px", margin: "0 auto" }}>
          Participa en los sorteos activos con tus puntos.
        </p>
      </motion.div>

      {/* Winner overlay */}
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setWinner(null)}>
            <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 160 }}
              style={{ padding: "40px", borderRadius: "20px", textAlign: "center", maxWidth: "320px", margin: "0 16px", background: "rgba(14,14,18,0.95)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 0 60px rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: "28px", marginBottom: "16px" }}>🏆</p>
              <p className="label" style={{ marginBottom: "6px" }}>Premio</p>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "20px" }}>{winner.prize}</p>
              {winner.user.avatar && (
                <Image src={winner.user.avatar} alt={winner.user.username} width={64} height={64}
                  style={{ borderRadius: "50%", margin: "0 auto 12px", display: "block", border: "2px solid rgba(255,255,255,0.2)" }} />
              )}
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "22px", color: "#fff" }}>{winner.user.username}</p>
              <p style={{ fontSize: "12px", color: "var(--t4)", marginTop: "6px" }}>¡Felicitaciones!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "18px" }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ height: "380px", borderRadius: "18px", background: "var(--bg2)", animation: "pulse 1.5s infinite" }} />)}
        </div>
      ) : giveaways.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--t4)" }}>
          <Gift size={40} style={{ margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "20px" }}>Sin sorteos activos</p>
          <p style={{ fontSize: "13px", marginTop: "8px" }}>¡Vuelve pronto!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "18px" }}>
          {giveaways.map((g, i) => (
            <motion.div key={g.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{
                borderRadius: "18px", overflow: "hidden",
                background: "rgba(14,14,18,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", flexDirection: "column",
                opacity: g.estado === "finalizado" ? 0.6 : 1,
                transition: "transform 0.25s, box-shadow 0.25s, border-color 0.25s",
              }}
              whileHover={{ y: g.estado === "activo" ? -6 : 0 }}
            >
              {/* Image */}
              <div style={{ position: "relative", height: "200px", background: "var(--bg2)", overflow: "hidden" }}>
                {g.imagen ? (
                  <Image src={g.imagen} alt={g.premio} fill style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "52px" }}>🎁</div>
                )}
                {/* Gradient overlay at bottom */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(transparent, rgba(14,14,18,0.9))" }} />
                {/* Status badge */}
                <div style={{ position: "absolute", top: "14px", left: "14px" }}>
                  {g.estado === "activo" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(83,252,24,0.3)" }}>
                      <span className="live-dot" style={{ width: "5px", height: "5px" }} />
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#53FC18", letterSpacing: "0.12em" }}>ACTIVO</span>
                    </div>
                  ) : (
                    <div style={{ padding: "5px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--t4)", letterSpacing: "0.12em" }}>FINALIZADO</span>
                    </div>
                  )}
                </div>
                {/* Participants count badge */}
                <div style={{ position: "absolute", top: "14px", right: "14px", display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Users size={10} style={{ color: "var(--t3)" }} />
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--t2)" }}>{g.participantes.length}</span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "17px", color: "#fff", marginBottom: "6px", lineHeight: 1.3 }}>{g.premio}</h3>
                {g.descripcion && (
                  <p style={{ fontSize: "12px", color: "var(--t3)", marginBottom: "14px", lineHeight: 1.6 }}>{g.descripcion}</p>
                )}

                {/* Participants avatars */}
                {g.participantes.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px" }}>
                    <div style={{ display: "flex" }}>
                      {g.participantes.slice(0, 5).map((p, idx) => (
                        <div key={p.id} style={{
                          width: "26px", height: "26px", borderRadius: "50%",
                          border: "2px solid rgba(14,14,18,0.9)", background: "var(--bg3)",
                          overflow: "hidden", marginLeft: idx > 0 ? "-8px" : 0, position: "relative", zIndex: 5 - idx
                        }}>
                          {p.avatar && <Image src={p.avatar} alt={p.username} width={26} height={26} />}
                        </div>
                      ))}
                    </div>
                    {g.participantes.length > 5 && (
                      <span style={{ fontSize: "11px", color: "var(--t4)" }}>+{g.participantes.length - 5} más</span>
                    )}
                  </div>
                )}

                <div style={{ flex: 1 }} />

                {/* Action */}
                {g.estado === "finalizado" && g.ganador ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Trophy size={13} style={{ color: "#fff" }} />
                    <span style={{ fontSize: "12px", color: "var(--t3)" }}>Ganador: <strong style={{ color: "#fff" }}>{g.ganador.username}</strong></span>
                  </div>
                ) : g.estado === "activo" ? (
                  isIn(g) ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px", borderRadius: "10px", background: "rgba(83,252,24,0.06)", border: "1px solid rgba(83,252,24,0.2)" }}>
                      <Check size={13} style={{ color: "#53FC18" }} />
                      <span style={{ fontSize: "12px", color: "#53FC18", fontWeight: 600 }}>Ya estás participando</span>
                    </div>
                  ) : (
                    <button onClick={() => join(g.id)} disabled={joining === g.id} className="btn btn-primary" style={{ width: "100%" }}>
                      {joining === g.id
                        ? <div style={{ width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        : <><Zap size={13} /> Participar</>
                      }
                    </button>
                  )
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
