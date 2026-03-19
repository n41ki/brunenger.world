"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

interface Dot { x: number; y: number; vx: number; vy: number; r: number; a: number }

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dots: Dot[] = [];
    const COLOR = theme === "dark" ? "249,115,22" : "234,106,16";

    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 45; i++) {
      dots.push({
        x: Math.random() * c.width, y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > c.width)  d.vx *= -1;
        if (d.y < 0 || d.y > c.height) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLOR},${d.a})`;
        ctx.fill();
      });

      // Connect nearby dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(${COLOR},${(1 - dist / 130) * 0.08})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, [theme]);

  return <canvas ref={canvasRef} id="particles" />;
}
