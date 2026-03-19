"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getKickAuthUrl, isAuthenticated } from "@/lib/auth";
import { getStreamStatus } from "@/lib/api";
import ParticleBackground from "@/components/effects/ParticleBackground";
import LightningEffect from "@/components/effects/LightningEffect";
import Footer from "@/components/layout/Footer";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Zap, Play, Users, Trophy } from "lucide-react";

const STREAMER_AVATAR = "https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp";

interface StreamStatus {
  isLive: boolean;
  viewers?: number;
  title?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({ isLive: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
      return;
    }
    getStreamStatus()
      .then((res) => setStreamStatus(res.data))
      .catch(() => setStreamStatus({ isLive: false }));
  }, [router]);

  const handleLogin = () => {
    setLoading(true);
    window.location.href = getKickAuthUrl();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508]">
      <ParticleBackground />
      <LightningEffect />

      {/* Background radial gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-yellow-500/5 blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid opacity-30" />

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-16">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          {streamStatus.isLive ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-full live-indicator">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="font-orbitron font-bold text-red-400 text-sm tracking-widest">EN VIVO</span>
              {streamStatus.viewers && (
                <>
                  <span className="text-white/30">•</span>
                  <Users size={14} className="text-white/60" />
                  <span className="text-white/60 text-sm">{streamStatus.viewers.toLocaleString()}</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-white/30 inline-block" />
              <span className="font-orbitron font-bold text-white/40 text-sm tracking-widest">OFFLINE</span>
            </div>
          )}
        </motion.div>

        {/* Streamer avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, type: "spring", delay: 0.1 }}
          className="relative mb-6"
        >
          <div className="relative w-28 h-28 sm:w-36 sm:h-36">
            {/* Rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, #FF0033, #0066FF, #FFD700, #FF0033)",
                padding: "3px",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full bg-[#050508]" />
            </motion.div>
            {/* Avatar */}
            <div className="absolute inset-[4px] rounded-full overflow-hidden">
              <Image
                src={STREAMER_AVATAR}
                alt="Brunenger"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Glow pulse */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ boxShadow: [
                "0 0 20px rgba(255,0,51,0.4), 0 0 40px rgba(0,102,255,0.2)",
                "0 0 40px rgba(0,102,255,0.6), 0 0 80px rgba(255,0,51,0.2)",
                "0 0 20px rgba(255,0,51,0.4), 0 0 40px rgba(0,102,255,0.2)",
              ]}}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Hero title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-6"
        >
          <h1 className="font-orbitron font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight">
            <motion.span
              className="block text-white"
              animate={{ textShadow: ["0 0 20px rgba(255,255,255,0.2)", "0 0 40px rgba(255,255,255,0.4)", "0 0 20px rgba(255,255,255,0.2)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              BRUNENGER
            </motion.span>
            <motion.span
              className="block text-gradient-full"
              animate={{
                filter: [
                  "drop-shadow(0 0 15px rgba(0,102,255,0.8))",
                  "drop-shadow(0 0 30px rgba(255,0,51,0.8))",
                  "drop-shadow(0 0 15px rgba(0,102,255,0.8))",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              WORLD
            </motion.span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-rajdhani text-xl sm:text-2xl text-white/60 text-center mb-10 max-w-xl tracking-wide"
        >
          La comunidad más épica del streaming.{" "}
          <span className="text-blue-400">Únete, compite y gana.</span>
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            onClick={handleLogin}
            disabled={loading}
            className="relative group px-10 py-5 font-orbitron font-black text-lg tracking-wider rounded-xl overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Button background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-600 via-red-600 to-blue-600" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ boxShadow: "0 0 30px rgba(0,102,255,0.6), 0 0 60px rgba(255,0,51,0.3)" }} />
            <span className="relative flex items-center gap-3 text-white">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  CONECTANDO...
                </>
              ) : (
                <>
                  <Play size={20} fill="white" />
                  INICIAR SESIÓN CON KICK
                </>
              )}
            </span>
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex items-center gap-8 mt-16"
        >
          {[
            { icon: Users, label: "Comunidad", value: "10K+", color: "text-blue-400" },
            { icon: Trophy, label: "Rankings", value: "TOP 100", color: "text-yellow-400" },
            { icon: Zap, label: "Puntos", value: "ACTIVOS", color: "text-red-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1"
              whileHover={{ y: -3 }}
            >
              <stat.icon size={24} className={stat.color} />
              <span className={`font-orbitron font-black text-sm ${stat.color}`}>{stat.value}</span>
              <span className="text-white/40 text-xs font-rajdhani">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="w-full max-w-md h-px mt-12 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
        />
      </main>

      <Footer />
    </div>
  );
}
