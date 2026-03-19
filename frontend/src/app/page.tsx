"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getKickAuthUrl, isAuthenticated } from "@/lib/auth";
import { getStreamStatus } from "@/lib/api";
import LightningIcon from "@/components/ui/LightningIcon";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Particles from "@/components/effects/Particles";
import Footer from "@/components/layout/Footer";
import { Play, ExternalLink, Zap, Trophy, Gift, Users } from "lucide-react";

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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Particles />

      {/* ── Topbar ───────────────────────────── */}
      <header style={{
        position: "fixed", inset: "0 0 auto 0", zIndex: 50, height: "56px",
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          maxWidth: "1152px", margin: "0 auto", padding: "0 20px",
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div className="flex items-center gap-2">
            <span className="bolt"><LightningIcon size={19} /></span>
            <span className="display" style={{ fontSize: "17px", letterSpacing: "0.1em", color: "var(--t1)" }}>BRUNENGER</span>
          </div>
          <div className="flex items-center gap-2">
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

      {/* ── Hero + Stream ────────────────────── */}
      <section style={{ paddingTop: "56px", minHeight: "100vh", display: "flex", flexDirection: "row" }}
        className="flex-col lg:flex-row">

        {/* Left */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}
          className="px-8 lg:px-16 xl:px-20 py-20 lg:py-0 relative z-10">

          {/* Eyebrow */}
          <motion.div className="anim-0 flex items-center gap-3 mb-8">
            <span className="hr-accent" />
            <span className="label">Comunidad oficial · Kick</span>
          </motion.div>

          {/* Main title */}
          <motion.div className="anim-1 flex items-start gap-4 mb-5">
            <span className="bolt mt-1 hidden sm:block"><LightningIcon size={54} /></span>
            <h1 className="display glow-text"
              style={{ fontSize: "clamp(4.5rem,13vw,9rem)", color: "var(--t1)", lineHeight: 0.95 }}>
              BRUNENGER
            </h1>
          </motion.div>

          <motion.p className="anim-2"
            style={{ color: "var(--t3)", fontSize: "15px", lineHeight: 1.7, maxWidth: "380px", marginBottom: "36px" }}>
            Streamer. Gamer. Creador de comunidad.<br />
            Únete, acumula puntos y gana premios exclusivos.
          </motion.p>

          {/* CTAs */}
          <motion.div className="anim-3 flex flex-wrap gap-3 mb-14">
            <button onClick={login} disabled={loading} className="btn btn-primary btn-lg">
              <Zap size={16} />
              {loading ? "Conectando..." : "Iniciar sesión con Kick"}
            </button>
            <a href={`https://kick.com/${CHANNEL}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-outline btn-lg">
                <ExternalLink size={14} /> Ver canal
              </button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div className="anim-4 flex gap-10">
            {[
              { icon: Users,  v: "10K+",   l: "Comunidad" },
              { icon: Trophy, v: "TOP",    l: "Rankings"  },
              { icon: Gift,   v: "Live",   l: "Sorteos"   },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <s.icon size={14} style={{ color: "var(--t4)" }} />
                <span className="display" style={{ fontSize: "18px", color: "var(--t1)" }}>{s.v}</span>
                <span style={{ fontSize: "11px", color: "var(--t4)", fontWeight: 500 }}>{s.l}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — stream */}
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            width: "100%", maxWidth: "520px",
            borderLeft: "1px solid var(--border)",
            background: "var(--bg1)",
            display: "flex", flexDirection: "column",
            minHeight: "460px",
          }}
          className="lg:max-w-[520px] xl:max-w-[560px]"
        >
          {/* Channel bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px", borderBottom: "1px solid var(--border)"
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
          <div style={{ flex: 1, position: "relative", background: "var(--bg)", minHeight: "300px" }}>
            <iframe
              src={`https://player.kick.com/${CHANNEL}?autoplay=false&muted=true`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              allowFullScreen allow="autoplay; fullscreen" title="Stream"
            />
          </div>

          {/* Footer */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px" }}>
            {stream.title && <p style={{ fontSize: "12px", color: "var(--t4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stream.title}</p>}
            <a href={`https://kick.com/${CHANNEL}`} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
              <button className="btn btn-ghost" style={{ width: "100%", fontSize: "13px" }}>
                <Play size={12} /> Abrir en Kick
              </button>
            </a>
          </div>
        </motion.aside>
      </section>

      {/* ── Features ─────────────────────────── */}
      <section style={{ padding: "72px 0", borderTop: "1px solid var(--border)", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="label" style={{ display: "block", marginBottom: "12px" }}>¿Qué te espera?</span>
            <h2 className="display" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "var(--t1)" }}>LA COMUNIDAD</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
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
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "var(--orange-bg)", border: "1px solid var(--orange-bd)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "18px",
                }}>
                  <f.icon size={18} style={{ color: "var(--orange)" }} />
                </div>
                <p style={{ fontWeight: 600, color: "var(--t1)", marginBottom: "8px" }}>{f.t}</p>
                <p style={{ fontSize: "13px", color: "var(--t3)", lineHeight: 1.6 }}>{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────── */}
      <section style={{ padding: "72px 0", borderTop: "1px solid var(--border)", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 20px" }}>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{ position: "relative", flexShrink: 0 }}>
              <Image src={AVATAR} alt="Brunenger" width={148} height={148}
                style={{ borderRadius: "20px", border: "1.5px solid var(--border2)", display: "block" }} />
              <span className="bolt" style={{ position: "absolute", bottom: "-8px", right: "-8px" }}>
                <LightningIcon size={26} />
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <span className="label" style={{ display: "block", marginBottom: "12px" }}>Sobre Brunenger</span>
              <h2 className="display" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "var(--t1)", lineHeight: 1, marginBottom: "16px" }}>
                STREAMER.<br />
                <span style={{ color: "var(--orange)" }} className="glow-text">COMUNIDAD.</span>
              </h2>
              <p style={{ color: "var(--t3)", fontSize: "14px", lineHeight: 1.7, maxWidth: "440px", marginBottom: "24px" }}>
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

      {/* ── CTA ──────────────────────────────── */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--border)", position: "relative", zIndex: 10, textAlign: "center" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "0 20px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="bolt" style={{ display: "inline-block", marginBottom: "20px" }}><LightningIcon size={34} /></span>
            <h2 className="display glow-text" style={{ fontSize: "clamp(2.5rem,7vw,5rem)", color: "var(--t1)", marginBottom: "16px", lineHeight: 1 }}>
              ÚNETE A LA<br /><span style={{ color: "var(--orange)" }}>COMUNIDAD</span>
            </h2>
            <p style={{ color: "var(--t3)", fontSize: "14px", marginBottom: "28px" }}>
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
