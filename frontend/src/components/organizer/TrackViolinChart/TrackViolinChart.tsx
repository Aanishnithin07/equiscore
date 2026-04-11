// frontend/src/components/organizer/TrackViolinChart/TrackViolinChart.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, HeartPulse, Lightbulb } from 'lucide-react';

export interface ViolinData {
  id: string;
  name: string;
  type: 'health' | 'ai' | 'open';
  metrics: { min: number; max: number; median: number };
  // the distribution width at each score bucket 0-100 (steps of 5 typically)
  distribution: { score: number; value: number }[];
}

interface Props {
  tracks: ViolinData[];
}

/**
 * @component TrackViolinChart
 * @description Advanced density map rendering mirrored SVG bezier bounds projecting standard deviations linearly.
 */
export const TrackViolinChart: React.FC<Props> = ({ tracks }) => {
  const width = 240;
  const height = 300;
  const padding = { y: 20, x: 40 };
  const h = height - padding.y * 2;
  const cx = width / 2;

  // Max value across all distributions to normalize width
  const globalMax = Math.max(...tracks.flatMap(t => t.distribution.map(d => d.value)));

  const getStyle = (type: string) => {
    switch (type) {
      case 'health': return { color: 'var(--teal-400)', grad: 'grad-health', icon: HeartPulse };
      case 'open': return { color: 'var(--amber-400)', grad: 'grad-open', icon: Lightbulb };
      default: return { color: 'var(--accent-400)', grad: 'grad-ai', icon: BrainCircuit };
    }
  };

  const drawViolin = (dist: ViolinData['distribution']) => {
    // Left side (mirrored)
    let leftPath = `M ${cx} ${padding.y + h}`; 
    let rightPath = `M ${cx} ${padding.y}`;

    dist.forEach(d => {
        const y = padding.y + h - (d.score / 100) * h;
        const w = (d.value / globalMax) * (cx - padding.x);
        leftPath += ` L ${cx - w} ${y}`;
    });
    
    // Right side (top to bottom)
    const rev = [...dist].reverse();
    rev.forEach(d => {
        const y = padding.y + h - (d.score / 100) * h;
        const w = (d.value / globalMax) * (cx - padding.x);
        rightPath += ` L ${cx + w} ${y}`;
    });

    return `${leftPath} L ${cx} ${padding.y} ${rightPath.replace(`M ${cx} ${padding.y}`, '')} Z`;
  };

  return (
    <div className="w-full glass-2 rounded-xl border border-[var(--border-default)] p-6">
        <span className="microlabel text-[var(--accent-400)] block mb-6">TRACK DISTRIBUTION</span>
        
        <div className="flex justify-around items-end">
            {tracks.map((t, idx) => {
                const s = getStyle(t.type);
                const Icon = s.icon;
                const path = drawViolin(t.distribution);

                return (
                    <div key={t.id} className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-4">
                            <Icon size={16} color={s.color} />
                            <span className="font-sans font-bold text-[13px] text-white">{t.name}</span>
                        </div>
                        
                        <div className="relative w-[180px] sm:w-[240px] h-[300px]">
                            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="grad-ai" x1="0" y1="1" x2="0" y2="0">
                                        <stop offset="0%" stopColor="var(--accent-400)" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="var(--accent-400)" stopOpacity="0.8" />
                                    </linearGradient>
                                    <linearGradient id="grad-health" x1="0" y1="1" x2="0" y2="0">
                                        <stop offset="0%" stopColor="var(--teal-400)" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="var(--teal-400)" stopOpacity="0.8" />
                                    </linearGradient>
                                    <linearGradient id="grad-open" x1="0" y1="1" x2="0" y2="0">
                                        <stop offset="0%" stopColor="var(--amber-400)" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="var(--amber-400)" stopOpacity="0.8" />
                                    </linearGradient>
                                </defs>

                                {/* Y Axis Rules bg */}
                                {[0,50,100].map(val => (
                                    <line key={val} x1={0} x2={width} y1={padding.y + h - (val/100)*h} y2={padding.y + h - (val/100)*h} stroke="var(--border-ghost)" strokeDasharray="2 4" />
                                ))}

                                <motion.g
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                                    style={{ originX: '50%' }}
                                >
                                    <path d={path} fill={`url(#${s.grad})`} stroke={s.color} strokeWidth="1.5" className="transition-all hover:brightness-125" />
                                    
                                    {/* Median horizontal tick */}
                                    <line 
                                        x1={cx - 15} x2={cx + 15} 
                                        y1={padding.y + h - (t.metrics.median/100)*h} 
                                        y2={padding.y + h - (t.metrics.median/100)*h} 
                                        stroke={s.color} strokeWidth="3" strokeLinecap="round" 
                                    />
                                </motion.g>
                            </svg>
                        </div>

                        {/* Metrics Table */}
                        <div className="w-[180px] grid grid-cols-3 gap-2 mt-4 glass-1 border border-[var(--border-subtle)] rounded-lg p-3">
                            <div className="flex flex-col items-center">
                                <span className="font-mono text-[9px] text-[var(--text-tertiary)] tracking-wider">MIN</span>
                                <span className="font-mono text-[13px] font-bold text-white">{t.metrics.min}</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-r border-[var(--border-ghost)]">
                                <span className="font-mono text-[9px] text-[var(--text-tertiary)] tracking-wider">MED</span>
                                <span className="font-mono text-[13px] font-bold" style={{ color: s.color }}>{t.metrics.median}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-mono text-[9px] text-[var(--text-tertiary)] tracking-wider">MAX</span>
                                <span className="font-mono text-[13px] font-bold text-white">{t.metrics.max}</span>
                            </div>
                        </div>

                    </div>
                )
            })}
        </div>
    </div>
  );
};
