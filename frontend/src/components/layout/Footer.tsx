"use client";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-blue-500/20 bg-[#050508]/90 backdrop-blur-md mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-black text-xl text-gradient-full">BRUNENGER WORLD</span>
          </div>

          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Zap size={14} className="text-blue-400" />
            <span>Desarrollado por</span>
            <motion.a
              href="https://irlcontrol.net"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              IRLControl
            </motion.a>
          </div>

          <div className="text-white/30 text-xs font-rajdhani">
            © {new Date().getFullYear()} Brunenger World. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
