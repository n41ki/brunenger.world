"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: "dot" | "spark" | "energy";
}

interface SpeedLine {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  color: string;
}

const COLORS = ["#FF0033", "#0066FF", "#FFD700", "#FF3366", "#3399FF"];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const speedLinesRef = useRef<SpeedLine[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize speed lines
    for (let i = 0; i < 15; i++) {
      speedLinesRef.current.push(createSpeedLine(canvas));
    }

    // Initialize particles
    for (let i = 0; i < 60; i++) {
      particlesRef.current.push(createParticle(canvas));
    }

    function createSpeedLine(c: HTMLCanvasElement): SpeedLine {
      return {
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        length: Math.random() * 150 + 50,
        speed: Math.random() * 8 + 4,
        alpha: Math.random() * 0.4 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }

    function createParticle(c: HTMLCanvasElement): Particle {
      const types: Particle["type"][] = ["dot", "spark", "energy"];
      return {
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.8 + 0.2,
        decay: Math.random() * 0.005 + 0.001,
        type: types[Math.floor(Math.random() * types.length)],
      };
    }

    function drawEnergyLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, alpha: number) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw speed lines
      speedLinesRef.current.forEach((line, i) => {
        drawEnergyLine(ctx, line.x, line.y, line.x + line.length, line.y, line.color, line.alpha);
        line.x += line.speed;
        if (line.x > canvas.width + 200) {
          speedLinesRef.current[i] = createSpeedLine(canvas);
          speedLinesRef.current[i].x = -200;
        }
      });

      // Draw particles with connections
      particlesRef.current.forEach((p, i) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;

        if (p.type === "spark") {
          // Draw cross/spark
          ctx.beginPath();
          ctx.fillRect(p.x - p.size / 2, p.y - p.size * 2, p.size / 2, p.size * 4);
          ctx.fillRect(p.x - p.size * 2, p.y - p.size / 2, p.size * 4, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Connect nearby particles
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            drawEnergyLine(ctx, p.x, p.y, p2.x, p2.y, p.color, alpha);
          }
        }
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
