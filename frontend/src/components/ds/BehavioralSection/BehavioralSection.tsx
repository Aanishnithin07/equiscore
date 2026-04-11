// frontend/src/components/ds/BehavioralSection/BehavioralSection.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScoreRing } from '../ScoreRing/ScoreRing';
import { spring } from '../../../lib/motion-config';

interface BehaviorData {
  score: number;
  confidence: number;
  pacing: {
    problem: number; // 0-1 percentage of total time
    solution: number;
    demo: number;
    team: number;
    ask: number;
  };
  fillerWords: Array<{ word: string; count: number }>;
}

export const BehavioralSection: React.FC<{ data: BehaviorData }> = ({ data }) => {
  return (
    <div className="w-full mt-10 flex flex-col gap-6 opacity-0 animate-[fadeUp_0.6s_ease-out_forwards]">
      
      {/* Header Card */}
      <div className="glass-3 rounded-[var(--radius-lg)] border-t-[1px] border-t-[var(--accent-400)] border-x-transparent border-b-transparent px-6 py-5 flex items-center justify-between shadow-lg relative overflow-hidden">
        <div className="mesh-card opacity-40" />
        <div className="flex flex-col gap-2 relative z-10 w-2/3">
          <h2 className="heading-3 text-white tracking-tight">Pitch Delivery Analysis</h2>
          <p className="text-[13px] font-sans text-[var(--text-secondary)] leading-relaxed">
            Multimodal tracing detected a highly structured narrative cadence, though rushed through 
            the technical implementation details. Confidence remained exceedingly strong during Q&A simulations.
          </p>
        </div>
        <div className="relative z-10 scale-90 origin-right">
          <ScoreRing score={data.score} size="md" />
        </div>
      </div>

      <div className="flex gap-4">
        {/* Pacing River + Word Cloud */}
        <div className="flex-2 flex flex-col w-2/3 gap-4">
            
            {/* Pacing River */}
            <div className="glass-1 rounded-[var(--radius-md)] p-5 border border-[var(--border-default)]">
                <span className="microlabel text-[var(--text-tertiary)] mb-4 block">PACING RIVER</span>
                <div className="w-full h-[24px] rounded-full overflow-hidden flex shadow-inner relative bg-void">
                    {/* Problem */}
                    <div style={{ width: `${data.pacing.problem * 100}%` }} className="h-full bg-[var(--coral-400)] flex items-center justify-center border-r border-[#0B0B17]/50 transition-all">
                        {data.pacing.problem > 0.1 && <span className="text-[9px] font-bold text-[oklch(20%_0.02_20)]">PROB</span>}
                    </div>
                    {/* Solution */}
                    <div style={{ width: `${data.pacing.solution * 100}%` }} className="h-full bg-[var(--teal-400)] flex items-center justify-center border-r border-[#0B0B17]/50 transition-all">
                        {data.pacing.solution > 0.1 && <span className="text-[9px] font-bold text-[oklch(20%_0.02_20)]">SOL</span>}
                    </div>
                    {/* Demo */}
                    <div style={{ width: `${data.pacing.demo * 100}%` }} className="h-full bg-[var(--accent-400)] flex items-center justify-center border-r border-[#0B0B17]/50 transition-all">
                        {data.pacing.demo > 0.1 && <span className="text-[9px] font-bold text-[oklch(20%_0.02_20)]">DEMO</span>}
                    </div>
                    {/* Team */}
                    <div style={{ width: `${data.pacing.team * 100}%` }} className="h-full bg-[var(--amber-400)] flex items-center justify-center border-r border-[#0B0B17]/50 transition-all">
                        {data.pacing.team > 0.1 && <span className="text-[9px] font-bold text-[oklch(20%_0.02_20)]">TEAM</span>}
                    </div>
                    {/* Ask */}
                    <div style={{ width: `${data.pacing.ask * 100}%` }} className="h-full bg-[oklch(76%_0.15_145)] flex items-center justify-center transition-all">
                        {data.pacing.ask > 0.1 && <span className="text-[9px] font-bold text-[oklch(20%_0.02_20)]">ASK</span>}
                    </div>
                    
                    {/* Ideal Markers Overlay */}
                    <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-white opacity-40 mix-blend-overlay" />
                    <div className="absolute top-0 bottom-0 left-[45%] w-[1px] bg-white opacity-40 mix-blend-overlay" />
                    <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-white opacity-40 mix-blend-overlay" />
                    <div className="absolute top-0 bottom-0 left-[90%] w-[1px] bg-white opacity-40 mix-blend-overlay" />
                </div>
                <div className="flex justify-between mt-2 px-1">
                    <span className="text-[9px] text-[var(--text-tertiary)] font-mono">0:00</span>
                    <span className="text-[9px] text-[var(--text-tertiary)] font-mono">Ideal Flow Markers (White)</span>
                    <span className="text-[9px] text-[var(--text-tertiary)] font-mono">3:00</span>
                </div>
            </div>

            {/* Word Cloud pseudo-pack layout natively using flex wraps mapping scalar transforms */}
            <div className="glass-1 rounded-[var(--radius-md)] p-5 border border-[var(--border-default)] flex-1">
                <span className="microlabel text-[var(--text-tertiary)] mb-4 block">FILLER WORD CLOUD</span>
                <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center h-[120px] content-center cursor-pointer">
                    {data.fillerWords.map((word, i) => {
                        // Math scalar binding
                        const size = 10 + (word.count * 0.8);
                        const isHigh = word.count > 15;
                        const isMed = word.count > 8 && !isHigh;
                        return (
                            <motion.span 
                                key={i}
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ ...spring.bouncy, delay: i * 0.05 } as any}
                                className="font-sans font-bold hover:scale-110 transition-transform select-none"
                                style={{ 
                                    fontSize: `${size}px`,
                                    color: isHigh ? 'var(--coral-400)' : isMed ? 'var(--amber-400)' : 'var(--teal-400)',
                                    opacity: isHigh ? 1 : 0.8
                                }}
                                title={`${word.count} occurrences`}
                            >
                                {word.word}
                            </motion.span>
                        )
                    })}
                </div>
            </div>

        </div>

        {/* Confidence Meter Column */}
        <div className="glass-1 rounded-[var(--radius-md)] p-5 border border-[var(--border-default)] flex-1 flex flex-col items-center">
            <span className="microlabel text-[var(--text-tertiary)] mb-6 block w-full text-center">CONFIDENCE</span>
            
            <div className="relative w-[60px] h-[160px] flex justify-center mb-2">
                {/* SVG Tube Structure */}
                <svg width="60" height="160" viewBox="0 0 60 160" className="absolute inset-0 pointer-events-none drop-shadow-[0_0_12px_rgba(255,255,255,0.05)]">
                    <defs>
                        <linearGradient id="fluidGrad" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="var(--coral-400)"/>
                            <stop offset="50%" stopColor="var(--amber-400)"/>
                            <stop offset="100%" stopColor="var(--teal-400)"/>
                        </linearGradient>
                    </defs>
                    <rect x="20" y="10" width="20" height="120" rx="10" stroke="var(--border-subtle)" fill="var(--bg-elevated)" strokeWidth="1" />
                    <circle cx="30" cy="135" r="16" stroke="var(--border-subtle)" fill="var(--bg-elevated)" strokeWidth="1" />
                    <circle cx="30" cy="135" r="10" fill="var(--coral-400)" opacity="0.6"/>
                    <rect x="20" y="10" width="20" height="120" rx="10" stroke="rgba(255,255,255,0.1)" fill="none" strokeWidth="1" className="mix-blend-overlay" />
                    
                    {/* Tick marks */}
                    <line x1="42" y1="40" x2="48" y2="40" stroke="var(--text-tertiary)" strokeWidth="1" />
                    <line x1="42" y1="70" x2="48" y2="70" stroke="var(--text-tertiary)" strokeWidth="1" />
                    <line x1="42" y1="100" x2="48" y2="100" stroke="var(--text-tertiary)" strokeWidth="1" />
                </svg>

                {/* Animated Inner Fluid Fill mapped strictly clamping Y offsets natively */}
                <div className="absolute bottom-[25px] flex justify-center items-end" style={{ width: '20px', height: '110px' }}>
                    <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${data.confidence}%` }}
                        transition={{ type: 'spring', stiffness: 60, damping: 20, delay: 0.2 }}
                        className="w-[14px] rounded-full bottom-0 bg-gradient-to-t from-[var(--coral-400)] via-[var(--amber-400)] to-[var(--teal-400)]"
                        style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, boxShadow: '0 0 12px var(--teal-glow)' }}
                    />
                </div>
            </div>
            <span className="font-mono text-white text-[16px] font-bold tabular-nums">
                {data.confidence}<span className="text-[12px] text-[var(--text-tertiary)]">%</span>
            </span>
        </div>
      </div>
    </div>
  );
};
