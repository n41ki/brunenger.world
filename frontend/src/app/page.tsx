"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getKickAuthUrl, isAuthenticated } from "@/lib/auth";
import { getStreamStatus } from "@/lib/api";
import LightningIcon from "@/components/ui/LightningIcon";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Particles from "@/components/effects/Particles";
import Footer from "@/components/layout/Footer";
import { Play, ExternalLink, Zap, Trophy, Gift, Users, ArrowRight } from "lucide-react";

const AVATAR  = "https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp";
const CHANNEL = "brunenger";

interface Stream { isLive: boolean; viewers?: number; title?: string }

export default function Home() {
  const router = useRouter();
  const [stream,  setStream]  = useState<Stream>({ isLive: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) { router.push("/dashboard"); return; }
    getStreamStatus().then(r => setStream(r.data)).catch(() => {});
  }, [router]);

  const login = async () => {
    setLoading(true);
    window.location.href = await getKickAuthUrl();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>
      <Particles />

      {/* ── Topbar ─────────────────────────────────── */}
      <header style={{
        position: "fixed", inset: "0 0 auto 0", zIndex: 50, height: "60px",
        display: "flex", alignItems: "center",
        borderBottom: "1px solid transparent",
        transition: "all 0.3s",
      }}
        className="navbar"
      >
        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 24px",
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="bolt"><LightningIcon size={20} /></span>
            <span className="display" style={{ fontSize: "18px", letterSpacing: "0.12em", color: "var(--t1)" }}>BRUNENGER</span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: "28px" }} className="hidden md:flex">
            {["Stream", "Tienda", "Rankings"].map(l => (
              <span key={l} style={{ fontSize: "13px", fontWeight: 500, color: "var(--t3)", cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--t1)"}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--t3)"}
              >{l}</span>
            ))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {stream.isLive && (
              <div className="badge badge-orange hidden sm:flex">
                <span className="live-dot" style={{ width: "6px", height: "6px" }} />
                EN VIVO
                {stream.viewers && <span style={{ color: "var(--t3)" }}>· {stream.viewers.toLocaleString()}</span>}
              </div>
            )}
            <ThemeToggle />
            <button onClick={login} disabled={loading} className="btn btn-primary btn-sm">
              {loading ? "Conectando..." : "Iniciar sesión"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <section style={{
        paddingTop: "60px", minHeight: "100vh",
        display: "flex", alignItems: "center",
        position: "relative"
      }}>
        {/* Background glows */}
        <div className="hero-glow" style={{ top: "-100px", left: "30%", zIndex: 0 }} />
        <div className="hero-glow" style={{ bottom: "-150px", right: "10%", zIndex: 0, opacity: 0.6 }} />

        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "80px 24px",
          width: "100%", position: "relative", zIndex: 1,
          display: "flex", flexDirection: "row", alignItems: "center", gap: "60px"
        }} className="flex-col lg:flex-row">

          {/* Left content */}
          <div style={{ flex: 1 }}>
            {/* Eyebrow */}
            <motion.div className="anim-0" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <Image src={AVATAR} alt="Brunenger" width={28} height={28}
                style={{ borderRadius: "50%", border: "1.5px solid var(--orange-bd)" }} />
              <span className="label">Comunidad oficial · Kick.com</span>
              {stream.isLive && (
                <div className="badge badge-orange">
                  <span className="live-dot" style={{ width: "5px", height: "5px" }} />
                  EN VIVO
                </div>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1 className="anim-1 heading" style={{
              fontSize: "clamp(3.5rem,10vw,7rem)",
              lineHeight: 1.0,
              marginBottom: "8px",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 900,
            }}>
              <span className="gradient-text">BRUNENGER</span>
            </motion.h1>
            <motion.h2 className="anim-2 heading" style={{
              fontSize: "clamp(1.5rem,4vw,2.8rem)",
              lineHeight: 1.1,
              marginBottom: "24px",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
            }}>
              <span className="gradient-text-orange">Comunidad & Streams</span>
            </motion.h2>

            <motion.p className="anim-2" style={{
              color: "var(--t3)", fontSize: "15px", lineHeight: 1.75,
              maxWidth: "420px", marginBottom: "40px"
            }}>
              Únete a la comunidad, acumula puntos viendo streams y canjeándolos
              por premios exclusivos en la tienda.
            </motion.p>

            {/* CTAs */}
            <motion.div className="anim-3" style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "56px" }}>
              <button onClick={login} disabled={loading} className="btn btn-primary btn-lg">
                <Zap size={15} />
                {loading ? "Conectando..." : "Unirse con Kick"}
              </button>
              <a href={`https://kick.com/${CHANNEL}`} target="_blank" rel="noopener noreferrer">
                <button className="btn btn-outline btn-lg">
                  Ver canal <ArrowRight size={14} />
                </button>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div className="anim-4" style={{ display: "flex", gap: "36px", flexWrap: "wrap" }}>
              {[
                { icon: Users,  v: "10K+", l: "Comunidad" },
                { icon: Trophy, v: "TOP",  l: "Rankings"  },
                { icon: Gift,   v: "Live", l: "Sorteos"   },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--t1)", fontFamily: "'Poppins', sans-serif", marginBottom: "2px" }}>
                    {s.v}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--t4)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {s.l}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — stream embed */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              width: "100%", maxWidth: "480px", flexShrink: 0,
              borderRadius: "20px", overflow: "hidden",
              border: "1px solid var(--glass-border)",
              background: "var(--bg1)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
            className="w-full lg:max-w-[480px]"
          >
            {/* Channel bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderBottom: "1px solid var(--glass-border)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Image src={AVATAR} alt="Brunenger" width={34} height={34}
                  style={{ borderRadius: "50%", border: "1.5px solid var(--border2)" }} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--t1)" }}>Brunenger</p>
                  <p style={{ fontSize: "11px", color: "var(--t4)" }}>kick.com/brunenger</p>
                </div>
              </div>
              {stream.isLive
                ? <div className="badge badge-orange">
                    <span className="live-dot" style={{ width: "6px", height: "6px" }} />
                    EN VIVO
                    {stream.viewers && <span style={{ color: "var(--t3)" }}>· {stream.viewers.toLocaleString()}</span>}
                  </div>
                : <span style={{ fontSize: "11px", color: "var(--t4)", fontWeight: 500 }}>OFFLINE</span>
              }
            </div>

            {/* Embed */}
            <div style={{ position: "relative", background: "var(--bg)", aspectRatio: "16/9" }}>
              <iframe
                src={`https://player.kick.com/${CHANNEL}?autoplay=false&muted=true`}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                allowFullScreen allow="autoplay; fullscreen" title="Stream"
              />
            </div>

            {/* Open btn */}
            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--glass-border)" }}>
              {stream.title && (
                <p style={{ fontSize: "12px", color: "var(--t4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "8px" }}>
                  {stream.title}
                </p>
              )}
              <a href={`https://kick.com/${CHANNEL}`} target="_blank" rel="noopener noreferrer">
                <button className="btn btn-ghost" style={{ width: "100%", fontSize: "12px" }}>
                  <Play size={12} /> Abrir en Kick
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────── */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <p className="label" style={{ marginBottom: "12px" }}>¿Qué te espera?</p>
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 1.1 }}>
              <span className="gradient-text">La Comunidad</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {[
              { icon: Zap,    t: "Sistema de Puntos",  d: "Acumula puntos viendo streams y participando en el chat en tiempo real" },
              { icon: Trophy, t: "Rankings",           d: "Compite por ser el top viewer o chatter y escala posiciones" },
              { icon: Gift,   t: "Sorteos Exclusivos", d: "Participa en sorteos para la comunidad con premios reales" },
            ].map((f, i) => (
              <motion.div key={i} className="card card-hover"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ padding: "28px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: "var(--orange-bg)", border: "1px solid var(--orange-bd)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "18px",
                }}>
                  <f.icon size={18} style={{ color: "var(--orange)" }} />
                </div>
                <p style={{ fontWeight: 700, color: "var(--t1)", marginBottom: "8px", fontSize: "15px", fontFamily: "'Poppins', sans-serif" }}>{f.t}</p>
                <p style={{ fontSize: "13px", color: "var(--t3)", lineHeight: 1.6 }}>{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────── */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "64px", flexWrap: "wrap" }}>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div style={{
                  position: "absolute", inset: "-3px",
                  borderRadius: "23px",
                  background: "linear-gradient(135deg, var(--orange), transparent 60%)",
                  zIndex: 0
                }} />
                <Image src={AVATAR} alt="Brunenger" width={160} height={160}
                  style={{ borderRadius: "20px", display: "block", position: "relative", zIndex: 1 }} />
              </div>
              <span className="bolt" style={{ position: "absolute", bottom: "-8px", right: "-8px", zIndex: 2 }}>
                <LightningIcon size={28} />
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ flex: 1, minWidth: "260px" }}>
              <p className="label" style={{ marginBottom: "12px" }}>Sobre Brunenger</p>
              <h2 style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 800,
                fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 1.1, marginBottom: "18px"
              }}>
                <span className="gradient-text">Streamer.</span><br />
                <span className="gradient-text-orange">Comunidad.</span>
              </h2>
              <p style={{ color: "var(--t3)", fontSize: "14px", lineHeight: 1.75, maxWidth: "420px", marginBottom: "28px" }}>
                Brunenger es más que un streamer — es una comunidad donde cada viewer importa.
                Con un sistema de puntos, rankings y sorteos exclusivos, ser parte del canal tiene sus recompensas.
              </p>
              <button onClick={login} disabled={loading} className="btn btn-primary">
                <Zap size={14} /> Únete ahora
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section style={{ padding: "100px 0", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1, textAlign: "center" }}>
        <div className="hero-glow" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.6 }} />
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="bolt" style={{ display: "inline-block", marginBottom: "24px" }}>
              <LightningIcon size={36} />
            </span>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 900,
              fontSize: "clamp(2.5rem,7vw,5rem)", lineHeight: 1.05, marginBottom: "18px"
            }}>
              <span className="gradient-text">ÚNETE A LA</span><br />
              <span className="gradient-text-orange">COMUNIDAD</span>
            </h2>
            <p style={{ color: "var(--t3)", fontSize: "14px", marginBottom: "32px", lineHeight: 1.7 }}>
              Inicia sesión con Kick y empieza a acumular puntos hoy.
            </p>
            <button onClick={login} disabled={loading} className="btn btn-primary btn-xl">
              <Zap size={16} />
              {loading ? "Conectando..." : "Iniciar sesión con Kick"}
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
