// frontend/src/components/ds/EmptyState/EmptyState.tsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const MOCK_CARDS = [
  { title: "Behavioral Analytics", desc: "Identify pacing and confidence in real time." },
  { title: "Bias Auditing", desc: "Mathematical Pearson proof of fair AI decisions." },
  { title: "Vercel & Apple Scale", desc: "Designed natively bypassing sluggish frameworks." }
];

export const EmptyState: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle engine inside canvas (60fps minimal layer)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = 400;
    let height = canvas.height = 300;

    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.6 
        ? 'oklch(64% 0.180 282 / 0.2)' // accent
        : Math.random() > 0.5 
          ? 'oklch(72% 0.140 185 / 0.2)' // teal
          : 'oklch(68% 0.160 28 / 0.2)'  // coral
    }));

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges smoothly
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      
      {/* Absolute particle field container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-16 pointer-events-none">
        <canvas ref={canvasRef} className="opacity-70 blur-[0.5px]" />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center z-10"
      >
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mb-6 drop-shadow-[0_0_24px_rgba(100,28,226,0.3)]">
          <defs>
            <linearGradient id="logo-grad-large" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-400)" />
              <stop offset="100%" stopColor="var(--teal-400)" />
            </linearGradient>
          </defs>
          <path d="M4 6H12M4 12H12M4 18H20M14 6H20M14 12H20" stroke="url(#logo-grad-large)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <h4 className="heading-4 text-[var(--text-tertiary)] tracking-tight font-sans">
          Select a team from the leaderboard
        </h4>
      </motion.div>

      <div className="flex gap-4 mt-16 z-10">
        {MOCK_CARDS.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-48 glass-1 glass-noise px-4 py-4 rounded-[var(--radius-lg)] border border-[var(--border-ghost)] shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--accent-400)] to-transparent opacity-50" />
            <h5 className="text-[12px] font-bold text-[var(--text-secondary)] font-sans uppercase tracking-widest mb-1.5">
              {card.title}
            </h5>
            <p className="text-[11px] text-[var(--text-tertiary)] font-sans leading-relaxed">
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
