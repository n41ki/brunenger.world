"use client";
import { motion } from "framer-motion";

export default function LightningEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Corner energy bursts */}
      {[
        { pos: "top-0 left-0", rot: 45, color: "#FF0033" },
        { pos: "top-0 right-0", rot: -45, color: "#0066FF" },
        { pos: "bottom-0 left-0", rot: 135, color: "#0066FF" },
        { pos: "bottom-0 right-0", rot: -135, color: "#FFD700" },
      ].map((corner, i) => (
        <motion.div
          key={i}
          className={`absolute ${corner.pos} w-64 h-64`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7 }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <radialGradient id={`corner-grad-${i}`} cx="50%" cy="50%">
                <stop offset="0%" stopColor={corner.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={corner.color} stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="0" cy="0" rx="200" ry="200" fill={`url(#corner-grad-${i})`} />
            {/* Lightning bolts */}
            {[0, 30, 60].map((angle, j) => (
              <motion.line
                key={j}
                x1="0"
                y1="0"
                x2={Math.cos((angle * Math.PI) / 180) * 180}
                y2={Math.sin((angle * Math.PI) / 180) * 180}
                stroke={corner.color}
                strokeWidth="1"
                strokeOpacity="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: j * 0.3 + i * 0.5 }}
              />
            ))}
          </svg>
        </motion.div>
      ))}

      {/* Horizontal scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,102,255,0.4), rgba(0,102,255,0.4), transparent)" }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
