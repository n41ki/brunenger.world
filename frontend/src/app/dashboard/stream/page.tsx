"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getStreamStatus } from "@/lib/api";
import { ExternalLink, Users, Play } from "lucide-react";

const KICK_CHANNEL = "brunenger";
const STREAMER_AVATAR = "https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp";

interface Stream { isLive: boolean; viewers?: number; title?: string; game?: string }

export default function StreamPage() {
  const [stream, setStream] = useState<Stream>({ isLive: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStreamStatus().then((r) => setStream(r.data)).catch(() => {}).finally(() => setLoading(false));
    const t = setInterval(() => getStreamStatus().then((r) => setStream(r.data)).catch(() => {}), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-widest text-white mb-1">STREAM</h1>
            <p className="font-body text-sm text-[#555]">Canal oficial en Kick</p>
          </div>
          <a href={`https://kick.com/${KICK_CHANNEL}`} target="_blank" rel="noopener noreferrer">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ghost text-sm font-body font-medium"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            >
              <ExternalLink size={14} />
              Kick
            </motion.button>
          </a>
        </div>
      </motion.div>

      {/* Two columns: stream + chat */}
      <div className="flex flex-col xl:flex-row gap-4">

        {/* Stream */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 rounded-2xl overflow-hidden border border-white/6 bg-[#111] flex flex-col"
        >
          {/* Channel bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Image src={STREAMER_AVATAR} alt="Brunenger" width={32} height={32}
                className="rounded-full border border-white/10" />
              <div>
                <p className="font-body font-semibold text-sm text-white">Brunenger</p>
                {stream.title && <p className="text-xs text-[#555] truncate max-w-[220px]">{stream.title}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {stream.viewers && (
                <div className="flex items-center gap-1.5 text-xs font-body text-[#555]">
                  <Users size={12} />
                  {stream.viewers.toLocaleString()}
                </div>
              )}
              {stream.isLive ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] live-dot" />
                  <span className="text-xs font-body font-bold text-[#FF6B00] tracking-wider">EN VIVO</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#444]" />
                  <span className="text-xs font-body text-[#444]">OFFLINE</span>
                </div>
              )}
            </div>
          </div>

          {/* Player */}
          <div className="relative bg-[#0B0B0B]" style={{ aspectRatio: "16/9" }}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#FF6B00]/30 border-t-[#FF6B00] animate-spin" />
              </div>
            ) : (
              <iframe
                src={`https://player.kick.com/${KICK_CHANNEL}?autoplay=true&muted=false`}
                className="w-full h-full absolute inset-0"
                allowFullScreen
                allow="autoplay; fullscreen"
                title="Brunenger Stream"
              />
            )}
          </div>

          {/* Bottom bar */}
          <div className="px-5 py-3 border-t border-white/5">
            <a href={`https://kick.com/${KICK_CHANNEL}`} target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl btn-ghost text-sm font-body font-medium">
                <Play size={13} />
                Abrir en Kick
              </button>
            </a>
          </div>
        </motion.div>

        {/* Chat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full xl:w-80 rounded-2xl overflow-hidden border border-white/6 bg-[#111] flex flex-col"
          style={{ minHeight: "460px" }}
        >
          <div className="px-5 py-3.5 border-b border-white/5">
            <p className="font-body font-semibold text-sm text-white">Chat en vivo</p>
          </div>
          <div className="flex-1">
            <iframe
              src={`https://kick.com/${KICK_CHANNEL}/chatroom`}
              className="w-full h-full"
              style={{ minHeight: "400px" }}
              title="Chat"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
