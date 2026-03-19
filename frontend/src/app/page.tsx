"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getKickAuthUrl, isAuthenticated } from "@/lib/auth";
import { getStreamStatus } from "@/lib/api";
import { useRouter } from "next/navigation";
import LightningIcon from "@/components/ui/LightningIcon";
import Footer from "@/components/layout/Footer";
import { Play, Users, ExternalLink, Zap, Trophy, Gift } from "lucide-react";

const STREAMER_AVATAR = "https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp";
const KICK_CHANNEL = "brunenger";

interface Stream { isLive: boolean; viewers?: number; title?: string }

export default function HomePage() {
  const router = useRouter();
  const [stream, setStream] = useState<Stream>({ isLive: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) { router.push("/dashboard"); return; }
    getStreamStatus().then((r) => setStream(r.data)).catch(() => {});
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    const url = await getKickAuthUrl();
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] noise">

      {/* ── Navbar simple ─────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="lightning-glow"><LightningIcon size={20} /></div>
            <span className="font-display text-xl tracking-widest text-white">BRUNENGER</span>
          </div>
          <div className="flex items-center gap-3">
            {stream.isLive && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] live-dot" />
                <span className="text-xs font-body font-semibold text-[#FF6B00] tracking-widest">EN VIVO</span>
                {stream.viewers && (
                  <span className="text-xs text-[#888]">{stream.viewers.toLocaleString()}</span>
                )}
              </div>
            )}
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              className="px-5 py-2 rounded-lg btn-primary text-sm font-body font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Conectando..." : "Iniciar sesión"}
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Hero + Stream ─────────────────────── */}
      <section className="pt-16 min-h-screen flex flex-col lg:flex-row">

        {/* Left — Hero text */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16 lg:py-0">
          {/* Overline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-8 bg-[#FF6B00]" />
            <span className="text-xs font-body font-semibold tracking-[0.2em] text-[#FF6B00] uppercase">
              Comunidad oficial
            </span>
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="lightning-glow mt-2 hidden sm:block">
                <LightningIcon size={48} />
              </div>
              <h1 className="font-display text-[clamp(4rem,12vw,9rem)] leading-none text-grad-white">
                BRUNENGER
              </h1>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="font-body text-[#555] text-lg max-w-md leading-relaxed mb-10"
          >
            Streamer. Jugador. Creador de comunidad.<br />
            Únete, gana puntos y forma parte de algo grande.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap items-center gap-4 mb-12"
          >
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl btn-primary font-body font-semibold text-sm tracking-wide"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Zap size={16} />
              {loading ? "Conectando..." : "Iniciar sesión con Kick"}
            </motion.button>
            <a href={`https://kick.com/${KICK_CHANNEL}`} target="_blank" rel="noopener noreferrer">
              <motion.button
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl btn-ghost font-body font-semibold text-sm tracking-wide"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <ExternalLink size={14} />
                Ver canal
              </motion.button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-8"
          >
            {[
              { icon: Users,  value: "10K+",   label: "Comunidad" },
              { icon: Trophy, value: "TOP",     label: "Rankings" },
              { icon: Gift,   value: "Sorteos", label: "Activos" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-1">
                <s.icon size={16} className="text-[#444]" />
                <span className="font-display text-lg tracking-widest text-white">{s.value}</span>
                <span className="text-xs font-body text-[#444]">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — Stream panel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="w-full lg:w-[520px] xl:w-[580px] flex flex-col border-l border-white/5 bg-[#111]"
        >
          {/* Stream header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Image src={STREAMER_AVATAR} alt="Brunenger" width={36} height={36}
                className="rounded-full border border-white/10" />
              <div>
                <p className="font-body font-semibold text-sm text-white">Brunenger</p>
                <p className="text-xs font-body text-[#555]">kick.com/brunenger</p>
              </div>
            </div>
            {stream.isLive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] live-dot" />
                <span className="text-xs font-body font-bold text-[#FF6B00] tracking-wider">EN VIVO</span>
                {stream.viewers && (
                  <span className="text-xs text-[#666]">· {stream.viewers.toLocaleString()}</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#444]" />
                <span className="text-xs font-body text-[#444]">OFFLINE</span>
              </div>
            )}
          </div>

          {/* Stream embed */}
          <div className="flex-1 relative bg-[#0B0B0B]" style={{ minHeight: "320px" }}>
            <iframe
              src={`https://player.kick.com/${KICK_CHANNEL}?autoplay=false&muted=true`}
              className="w-full h-full absolute inset-0"
              style={{ minHeight: "320px" }}
              allowFullScreen
              allow="autoplay; fullscreen"
              title="Brunenger Stream"
            />
          </div>

          {/* Stream footer */}
          <div className="px-5 py-4 border-t border-white/5 space-y-3">
            {stream.title && (
              <p className="text-sm font-body text-[#888] truncate">{stream.title}</p>
            )}
            <a href={`https://kick.com/${KICK_CHANNEL}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg btn-ghost text-sm font-body font-medium">
              <Play size={14} />
              Abrir en Kick
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Features strip ────────────────────── */}
      <section className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { icon: Zap,    title: "Sistema de Puntos",  desc: "Gana puntos viendo el stream y en el chat" },
              { icon: Trophy, title: "Rankings",           desc: "Compite por el top de viewers y chatters" },
              { icon: Gift,   title: "Sorteos",            desc: "Participa en sorteos exclusivos en tiempo real" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#111] px-8 py-10 group hover:bg-[#161616] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center mb-5
                  group-hover:bg-[#FF6B00]/20 group-hover:border-[#FF6B00]/40 transition-all">
                  <f.icon size={18} className="text-[#FF6B00]" />
                </div>
                <h3 className="font-body font-semibold text-white mb-2">{f.title}</h3>
                <p className="font-body text-sm text-[#555] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <div className="flex justify-center mb-6 lightning-glow">
              <LightningIcon size={40} />
            </div>
            <h2 className="font-display text-5xl sm:text-6xl tracking-widest text-white mb-4">
              ÚNETE AHORA
            </h2>
            <p className="font-body text-[#555] mb-8">
              Inicia sesión con tu cuenta de Kick y empieza a acumular puntos hoy.
            </p>
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              className="px-10 py-4 rounded-xl btn-primary font-body font-semibold text-base tracking-wide"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Conectando..." : "Iniciar sesión con Kick"}
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
