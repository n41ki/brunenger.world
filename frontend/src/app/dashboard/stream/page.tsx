"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getStreamStatus } from "@/lib/api";
import { ExternalLink, Users, Play } from "lucide-react";

const CHANNEL = "brunenger";
const AVATAR   = "https://files.kick.com/images/user/1704959/profile_image/conversion/1e3e2b85-0a64-49dc-937c-b138e691d27c-fullsize.webp";

interface Stream { isLive: boolean; viewers?: number; title?: string; game?: string }

export default function StreamPage() {
  const [stream,  setStream]  = useState<Stream>({ isLive: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStreamStatus().then(r => setStream(r.data)).catch(() => {}).finally(() => setLoading(false));
    const t = setInterval(() => getStreamStatus().then(r => setStream(r.data)).catch(() => {}), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="label mb-1">Canal oficial</div>
            <h1 className="display text-[36px] tracking-widest text-white">STREAM</h1>
          </div>
          <a href={`https://kick.com/${CHANNEL}`} target="_blank" rel="noopener noreferrer">
            <button className="btn btn-outline text-[12px] px-4 py-2">
              <ExternalLink size={12} /> Kick
            </button>
          </a>
        </div>
      </motion.div>

      <div className="flex flex-col xl:flex-row gap-4">

        {/* Player */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex-1 card overflow-hidden">
          {/* Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.07)]">
            <div className="flex items-center gap-3">
              <Image src={AVATAR} alt="Brunenger" width={30} height={30}
                className="rounded-full border border-[rgba(255,255,255,0.08)]" />
              <div>
                <p className="text-[13px] font-semibold text-white">Brunenger</p>
                {stream.title && <p className="text-[11px] text-[#444] truncate max-w-[200px]">{stream.title}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {stream.viewers && (
                <div className="flex items-center gap-1 text-[12px] text-[#444]">
                  <Users size={11} /> {stream.viewers.toLocaleString()}
                </div>
              )}
              {stream.isLive ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                  <span className="live-dot" style={{ width: "6px", height: "6px" }} />
                  <span className="text-[11px] font-bold tracking-widest accent">EN VIVO</span>
                </div>
              ) : (
                <span className="text-[11px] text-[#333]">OFFLINE</span>
              )}
            </div>
          </div>

          {/* Iframe */}
          <div className="relative bg-[#0B0B0B]" style={{ aspectRatio: "16/9" }}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full border-2 border-[rgba(249,115,22,0.2)] border-t-[#F97316] animate-spin" />
              </div>
            ) : (
              <iframe src={`https://player.kick.com/${CHANNEL}?autoplay=true`}
                className="absolute inset-0 w-full h-full" allowFullScreen allow="autoplay; fullscreen" title="Stream" />
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.07)]">
            <a href={`https://kick.com/${CHANNEL}`} target="_blank" rel="noopener noreferrer">
              <button className="btn btn-outline w-full text-[12px]"><Play size={11} />Abrir en Kick</button>
            </a>
          </div>
        </motion.div>

        {/* Chat */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="w-full xl:w-72 card overflow-hidden flex flex-col" style={{ minHeight: "420px" }}>
          <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.07)]">
            <p className="text-[13px] font-semibold text-white">Chat en vivo</p>
          </div>
          <div className="flex-1">
            <iframe src={`https://kick.com/${CHANNEL}/chatroom`} className="w-full h-full" style={{ minHeight: "370px" }} title="Chat" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
