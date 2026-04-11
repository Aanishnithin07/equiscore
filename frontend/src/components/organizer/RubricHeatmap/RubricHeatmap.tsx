// frontend/src/components/organizer/RubricHeatmap/RubricHeatmap.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, HeartPulse, Lightbulb } from 'lucide-react';
import { spring } from '../../../lib/motion-config';

export interface HeatmapCell {
  trackId: 'ai' | 'health' | 'open';
  category: string;
  avgScore: number; // 0-100
  teamCount: number;
}

interface Props {
  data: HeatmapCell[];
  categories: string[];
}

/**
 * @component RubricHeatmap
 * @description Advanced mathematical interpolator bridging CSS DOM elements mapping localized arrays.
 * Staggers cell intersections natively without canvas overhead.
 */
export const RubricHeatmap: React.FC<Props> = ({ data, categories }) => {
  const [hoverCell, setHoverCell] = useState<HeatmapCell | null>(null);

  // Gradient interpolator coral -> amber -> teal (0 to 100)
  const getCellColor = (score: number) => {
    // coral: 251, 113, 133
    // amber: 251, 191, 36
    // teal: 45, 212, 191
    if (score < 50) {
        const t = score / 50;
        return `rgb(${Math.round(251 + (251-251)*t)}, ${Math.round(113 + (191-113)*t)}, ${Math.round(133 + (36-133)*t)})`;
    } else {
        const t = (score - 50) / 50;
        return `rgb(${Math.round(251 + (45-251)*t)}, ${Math.round(191 + (212-191)*t)}, ${Math.round(36 + (191-36)*t)})`;
    }
  };

  const getColHeader = (trackId: string) => {
    switch (trackId) {
      case 'health': return { name: 'Healthcare', icon: HeartPulse, color: 'var(--teal-400)' };
      case 'open': return { name: 'Open', icon: Lightbulb, color: 'var(--amber-400)' };
      default: return { name: 'AI/ML', icon: BrainCircuit, color: 'var(--accent-400)' };
    }
  };

  const tracks = ['health', 'ai', 'open'] as const;

  return (
    <div className="w-full glass-2 rounded-xl border border-[var(--border-default)] p-6 flex flex-col">
      <span className="microlabel text-[var(--accent-400)] block mb-6">RUBRIC BREAKDOWN HEATMAP</span>

      <div className="flex w-full overflow-x-auto custom-scrollbar pb-4">
        <div className="flex flex-col min-w-[500px] w-full">
            
            {/* Header Row */}
            <div className="flex w-full mb-3">
                <div className="w-[180px] shrink-0" />
                {tracks.map(t => {
                    const h = getColHeader(t);
                    const Icon = h.icon;
                    return (
                        <div key={t} className="flex-1 flex flex-col items-center gap-2">
                            <Icon size={16} color={h.color} />
                            <span className="font-sans font-bold text-[12px] text-white tracking-widest">{h.name.toUpperCase()}</span>
                        </div>
                    );
                })}
            </div>

            {/* Grid Data */}
            {categories.map((cat, rowIdx) => (
                <div key={cat} className="flex w-full h-[60px] mb-2 items-center group">
                    <span className="w-[180px] shrink-0 text-right pr-6 font-sans text-[13px] text-[var(--text-secondary)] font-medium group-hover:text-white transition-colors line-clamp-2 leading-tight">
                        {cat}
                    </span>
                    
                    {tracks.map(t => {
                        const cell = data.find(d => d.category === cat && d.trackId === t);
                        if (!cell) return <div key={t} className="flex-1 m-1 bg-[var(--bg-elevated)] rounded-md" />;

                        return (
                            <motion.div 
                                key={t}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: rowIdx * 0.04, duration: 0.3 }}
                                className="flex-1 h-full m-1 rounded-lg relative cursor-crosshair"
                                onMouseEnter={() => setHoverCell(cell)}
                                onMouseLeave={() => setHoverCell(null)}
                            >
                                <motion.div 
                                    className="w-full h-full rounded-lg flex items-center justify-center border border-white/10"
                                    style={{ backgroundColor: getCellColor(cell.avgScore) }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={spring.snappy as any}
                                >
                                    {/* Text Contrast logic -> black if light, white if dark. Our scale is relatively bright, so black is safe but let's use white with text shadow for pop */}
                                    <span className="font-mono text-[14px] font-bold text-white drop-shadow-md">
                                        {cell.avgScore.toFixed(1)}
                                    </span>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-col gap-2">
        <div className="flex justify-between font-mono text-[10px] text-[var(--text-tertiary)] px-1">
            <span>LOW (0)</span>
            <span>AVG SCORE</span>
            <span>HIGH (100)</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'linear-gradient(to right, rgb(251, 113, 133), rgb(251, 191, 36), rgb(45, 212, 191))' }} />
      </div>

      <AnimatePresence>
        {hoverCell && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="fixed z-50 glass-4 p-3 border border-[var(--border-subtle)] rounded shadow-xl pointer-events-none w-[200px]"
                // Simplified positioning (in production this would track cursor clientX/clientY exactly)
                style={{ top: '20px', right: '20px' }} 
            >
                <div className="flex justify-between items-center mb-2">
                    <span className="font-sans text-[11px] text-[var(--accent-400)] uppercase font-bold">{hoverCell.category}</span>
                </div>
                <div className="flex justify-between font-mono text-[13px] text-white">
                    <span>Teams evaluated:</span>
                    <span className="font-bold">{hoverCell.teamCount}</span>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
