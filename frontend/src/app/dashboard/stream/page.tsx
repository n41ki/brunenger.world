"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getStreamStatus } from "@/lib/api";
import { Tv, Users, Radio, ExternalLink } from "lucide-react";

const KICK_CHANNEL = "brunenger"; // Kick channel slug

interface Stream {
  isLive: boolean;
  viewers?: number;
  title?: string;
  game?: string;
  thumbnail?: string;
}

export default function StreamPage() {
  const [stream, setStream] = useState<Stream>({ isLive: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStreamStatus()
      .then((r) => setStream(r.data))
      .catch(() => setStream({ isLive: false }))
      .finally(() => setLoading(false));

    // Refresh every 60s
    const interval = setInterval(() => {
      getStreamStatus()
        .then((r) => setStream(r.data))
        .catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-white mb-2">
              <span className="text-gradient-red-blue">STREAM</span>
            </h1>
            <p className="text-white/50 font-rajdhani text-lg">Canal oficial de Brunenger en Kick</p>
          </div>
          <a
            href={`https://kick.com/${KICK_CHANNEL}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.button
              className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-all text-sm font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <ExternalLink size={14} />
              Ver en Kick
            </motion.button>
          </a>
        </div>
      </motion.div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center gap-4 p-4 rounded-xl border mb-6 ${
          stream.isLive
            ? "bg-red-500/10 border-red-500/40"
            : "bg-white/5 border-white/10"
        }`}
      >
        {stream.isLive ? (
          <>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="font-orbitron font-bold text-red-400 tracking-widest text-sm">EN VIVO</span>
            </div>
            {stream.viewers && (
              <div className="flex items-center gap-1.5 text-white/60 text-sm">
                <Users size={14} />
                <span>{stream.viewers.toLocaleString()} espectadores</span>
              </div>
            )}
            {stream.title && (
              <span className="text-white/70 text-sm hidden sm:block truncate">{stream.title}</span>
            )}
            {stream.game && (
              <span className="ml-auto text-white/40 text-sm hidden md:block">{stream.game}</span>
            )}
          </>
        ) : (
          <>
            <Radio size={16} className="text-white/30" />
            <span className="font-orbitron text-sm text-white/40">OFFLINE — El streamer no está en vivo actualmente</span>
          </>
        )}
      </motion.div>

      {/* Stream embed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d1a]"
        style={{ aspectRatio: "16/9" }}
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : stream.isLive ? (
          <iframe
            src={`https://player.kick.com/${KICK_CHANNEL}?autoplay=true&muted=false`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            title="Brunenger Stream"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-5 text-white/30">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 opacity-60">
              <Image
                src="https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp"
                alt="Brunenger"
                fill
                className="object-cover grayscale"
              />
            </div>
            <div className="text-center">
              <p className="font-orbitron font-bold text-xl mb-2 text-white/40">Sin transmisión activa</p>
              <p className="font-rajdhani text-sm">Brunenger no está transmitiendo en este momento.</p>
              <p className="font-rajdhani text-sm">¡Sigue el canal para no perderte el próximo stream!</p>
            </div>
            <a
              href={`https://kick.com/${KICK_CHANNEL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2"
            >
              <motion.button
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-orbitron font-bold text-sm rounded-xl hover:bg-green-500 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <ExternalLink size={14} />
                SEGUIR EN KICK
              </motion.button>
            </a>
          </div>
        )}
      </motion.div>

      {/* Chat embed (only when live) */}
      {stream.isLive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d1a]"
          style={{ height: "500px" }}
        >
          <iframe
            src={`https://kick.com/${KICK_CHANNEL}/chatroom`}
            className="w-full h-full"
            title="Brunenger Chat"
          />
        </motion.div>
      )}
    </div>
  );
}
