"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getKickAuthUrl, isAuthenticated } from "@/lib/auth";
import { getStreamStatus } from "@/lib/api";
import LightningIcon from "@/components/ui/LightningIcon";
import Footer from "@/components/layout/Footer";
import { Play, ExternalLink, Zap, Trophy, Gift, Users } from "lucide-react";

const AVATAR = "https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp";
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
    <div className="min-h-screen" style={{ background: "#0B0B0B" }}>

      {/* ── Navbar ───────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(255,255,255,0.07)] bg-[#0B0B0B]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bolt"><LightningIcon size={19} /></span>
            <span className="display text-[17px] tracking-[0.08em]">BRUNENGER</span>
          </div>
          <div className="flex items-center gap-3">
            {stream.isLive && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <span className="live-dot" />
                <span className="text-[11px] font-semibold tracking-widest accent">EN VIVO</span>
                {stream.viewers && <span className="text-[11px] text-[#444]">{stream.viewers.toLocaleString()}</span>}
              </div>
            )}
            <button onClick={login} disabled={loading} className="btn btn-orange text-[13px] px-5 py-2">
              {loading ? "Conectando..." : "Iniciar sesión"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero + Stream ────────────────────── */}
      <section className="pt-14 min-h-screen flex flex-col lg:flex-row">

        {/* Left */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-20 py-20 lg:py-0">

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="flex items-center gap-3 mb-8">
            <span className="hr-orange" />
            <span className="label">Comunidad oficial · Kick</span>
          </motion.div>

          {/* Name */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.6 }}
            className="flex items-start gap-4 mb-6">
            <span className="bolt mt-1 hidden sm:block"><LightningIcon size={52} /></span>
            <h1 className="display text-[clamp(5rem,14vw,10rem)] text-white leading-none glow-text">
              BRUNENGER
            </h1>
          </motion.div>

          {/* Sub */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-[#555] text-[15px] leading-relaxed max-w-sm mb-10">
            Streamer. Gamer. Creador de comunidad.<br />
            Únete, acumula puntos y gana premios exclusivos.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="flex flex-wrap gap-3 mb-16">
            <button onClick={login} disabled={loading} className="btn btn-orange">
              <Zap size={15} />
              {loading ? "Conectando..." : "Iniciar sesión con Kick"}
            </button>
            <a href={`https://kick.com/${CHANNEL}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-outline">
                <ExternalLink size={13} />
                Ver canal
              </button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="flex gap-10">
            {[
              { icon: Users,  v: "10K+",   l: "Comunidad" },
              { icon: Trophy, v: "Top",    l: "Rankings"  },
              { icon: Gift,   v: "Live",   l: "Sorteos"   },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <s.icon size={14} className="text-[#333]" />
                <span className="display text-[18px] tracking-wider text-white">{s.v}</span>
                <span className="text-[11px] text-[#333] font-medium">{s.l}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — stream panel */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full lg:w-[500px] xl:w-[540px] border-l border-[rgba(255,255,255,0.07)] bg-[#111] flex flex-col"
          style={{ minHeight: "460px" }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(255,255,255,0.07)]">
            <div className="flex items-center gap-3">
              <Image src={AVATAR} alt="Brunenger" width={34} height={34}
                className="rounded-full border border-[rgba(255,255,255,0.08)]" />
              <div>
                <p className="text-[13px] font-semibold text-white">Brunenger</p>
                <p className="text-[11px] text-[#444]">kick.com/brunenger</p>
              </div>
            </div>
            {stream.isLive ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <span className="live-dot" style={{ width: "6px", height: "6px" }} />
                <span className="text-[11px] font-bold tracking-widest accent">EN VIVO</span>
                {stream.viewers && <span className="text-[11px] text-[#444]">· {stream.viewers.toLocaleString()}</span>}
              </div>
            ) : (
              <span className="text-[11px] text-[#333] font-medium">OFFLINE</span>
            )}
          </div>

          {/* Player */}
          <div className="relative flex-1 bg-[#0B0B0B]" style={{ minHeight: "300px" }}>
            <iframe
              src={`https://player.kick.com/${CHANNEL}?autoplay=false&muted=true`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen allow="autoplay; fullscreen"
              title="Stream"
            />
          </div>

          {/* Panel footer */}
          <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.07)] flex flex-col gap-3">
            {stream.title && <p className="text-[12px] text-[#444] truncate">{stream.title}</p>}
            <a href={`https://kick.com/${CHANNEL}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-outline w-full text-[13px]">
                <Play size={12} />
                Abrir en Kick
              </button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────── */}
      <section className="py-20 border-t border-[rgba(255,255,255,0.07)]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden">
            {[
              { icon: Zap,    t: "Puntos",   d: "Gana puntos viendo streams y participando en el chat" },
              { icon: Trophy, t: "Rankings", d: "Compite por ser el top viewer o chatter de la semana" },
              { icon: Gift,   t: "Sorteos",  d: "Participa en sorteos exclusivos para la comunidad"   },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-[#111] px-8 py-10 group hover:bg-[#161616] transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-5 transition-all"
                  style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)" }}>
                  <f.icon size={16} className="accent group-hover:scale-110 transition-transform" />
                </div>
                <p className="font-semibold text-white text-[14px] mb-2">{f.t}</p>
                <p className="text-[13px] text-[#444] leading-relaxed">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} className="flex-shrink-0">
              <div className="relative">
                <Image src={AVATAR} alt="Brunenger" width={160} height={160}
                  className="rounded-2xl border border-[rgba(255,255,255,0.08)]" />
                <div className="absolute -bottom-2 -right-2 bolt">
                  <LightningIcon size={28} />
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="label mb-4">Sobre Brunenger</div>
              <h2 className="display text-[clamp(2.5rem,5vw,4rem)] text-white mb-4 leading-none">
                STREAMER.<br />
                <span className="accent glow-text">COMUNIDAD.</span>
              </h2>
              <p className="text-[#555] text-[14px] leading-relaxed max-w-lg mb-6">
                Brunenger es más que un streamer — es una comunidad donde cada viewer importa.
                Con un sistema de puntos, rankings y sorteos exclusivos, ser parte del canal
                tiene sus recompensas.
              </p>
              <button onClick={login} disabled={loading} className="btn btn-orange text-[13px]">
                <Zap size={14} />
                Únete ahora
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────── */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.07)]">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="bolt inline-block mb-6"><LightningIcon size={36} /></span>
            <h2 className="display text-[clamp(3rem,8vw,6rem)] text-white mb-4 leading-none">
              ÚNETE A LA<br />
              <span className="accent glow-text">COMUNIDAD</span>
            </h2>
            <p className="text-[#444] text-[14px] mb-8">
              Inicia sesión con Kick y empieza a acumular puntos hoy.
            </p>
            <button onClick={login} disabled={loading} className="btn btn-orange px-8 py-3 text-[14px]">
              <Zap size={15} />
              {loading ? "Conectando..." : "Iniciar sesión con Kick"}
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
