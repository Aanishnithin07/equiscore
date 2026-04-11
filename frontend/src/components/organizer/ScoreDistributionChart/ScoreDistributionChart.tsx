// frontend/src/components/organizer/ScoreDistributionChart/ScoreDistributionChart.tsx
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../../lib/motion-config';

export interface ScoreBucket {
  score: number;
  count: number;
  percentile: number;
}

interface Props {
  data: ScoreBucket[];
  median: number;
  mean: number;
}

/**
 * @component ScoreDistributionChart
 * @description Advanced mathematical area curve renderer translating exact dataset bounds into structural 
 * bezier matrices skipping Recharts overhead natively. Exposes custom linear bounding gradients naturally.
 */
export const ScoreDistributionChart: React.FC<Props> = ({ data, median, mean }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  const getX = (score: number) => padding.left + (score / 100) * chartW;
  const getY = (count: number) => padding.top + chartH - (count / maxCount) * chartH;

  // Catmull-Rom or simple monotone interpolation for smooth path (Manual implementation for zero dependencies)
  const pathData = useMemo(() => {
    let path = `M ${getX(data[0]?.score || 0)} ${getY(data[0]?.count || 0)}`;
    for (let i = 0; i < data.length - 1; i++) {
        const p0 = data[i === 0 ? 0 : i - 1];
        const p1 = data[i];
        const p2 = data[i + 1];
        const p3 = data[i + 2] || p2;

        const cp1x = getX(p1.score) + (getX(p2.score) - getX(p0.score)) / 6;
        const cp1y = Math.min(padding.top + chartH, Math.max(padding.top, getY(p1.count) + (getY(p2.count) - getY(p0.count)) / 6));
        const cp2x = getX(p2.score) - (getX(p3.score) - getX(p1.score)) / 6;
        const cp2y = Math.min(padding.top + chartH, Math.max(padding.top, getY(p2.count) - (getY(p3.count) - getY(p1.count)) / 6));

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${getX(p2.score)} ${getY(p2.count)}`;
    }
    return path;
  }, [data]);

  const areaPath = `${pathData} L ${getX(data[data.length-1]?.score || 100)} ${padding.top + chartH} L ${getX(data[0]?.score || 0)} ${padding.top + chartH} Z`;

  return (
    <div className="w-full glass-2 rounded-xl border border-[var(--border-default)] p-6 relative">
        <span className="microlabel text-[var(--accent-400)] block mb-2">SCORE DISTRIBUTION</span>
        
        <div className="relative w-full aspect-[8/3] min-h-[240px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--coral-400)" />
                        <stop offset="50%" stopColor="var(--amber-400)" />
                        <stop offset="75%" stopColor="var(--teal-400)" />
                        <stop offset="90%" stopColor="var(--accent-400)" />
                    </linearGradient>
                    <linearGradient id="area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                    </linearGradient>
                    <clipPath id="reveal-clip">
                        <motion.rect 
                            initial={{ width: 0 }} 
                            animate={{ width: width }} 
                            transition={{ duration: 1.2, ease: "easeOut" }} 
                            height={height} 
                        />
                    </clipPath>
                </defs>

                {/* X Axis Rules */}
                {[0, 25, 50, 75, 100].map(s => (
                    <g key={s}>
                        <line x1={getX(s)} y1={padding.top} x2={getX(s)} y2={padding.top + chartH} stroke="var(--border-ghost)" strokeWidth="1" strokeDasharray="4 4" />
                        <text x={getX(s)} y={padding.top + chartH + 20} fill="var(--text-tertiary)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">{s}</text>
                    </g>
                ))}

                <g clipPath="url(#reveal-clip)">
                    {/* Area fill */}
                    <path d={areaPath} fill="url(#score-grad)" className="opacity-20" />
                    {/* Stroke line */}
                    <path d={pathData} fill="none" stroke="url(#score-grad)" strokeWidth="3" />

                    {/* Median Line */}
                    <g>
                        <line x1={getX(median)} y1={padding.top} x2={getX(median)} y2={padding.top + chartH} stroke="var(--amber-400)" strokeWidth="1.5" strokeDasharray="6 4" className="shadow-[0_0_10px_var(--amber-glow)]" />
                        <rect x={getX(median) - 30} y={0} width="60" height="16" fill="var(--bg-elevated)" rx="4" />
                        <text x={getX(median)} y={11} fill="var(--amber-400)" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Med: {median}</text>
                    </g>

                    {/* Mean Line */}
                    <g>
                        <line x1={getX(mean)} y1={padding.top} x2={getX(mean)} y2={padding.top + chartH} stroke="var(--accent-400)" strokeWidth="1.5" strokeDasharray="6 4" />
                        <rect x={getX(mean) - 30} y={padding.top + chartH + 28} width="60" height="16" fill="var(--bg-elevated)" rx="4" />
                        <text x={getX(mean)} y={padding.top + chartH + 39} fill="var(--accent-400)" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">Mean: {mean}</text>
                    </g>

                    {/* Interaction Hitboxes & Points */}
                    {data.map((d, i) => {
                        const px = getX(d.score);
                        const py = getY(d.count);
                        const isHovered = hoverIdx === i;

                        return (
                            <g key={i}>
                                {isHovered && <line x1={px} y1={padding.top} x2={px} y2={padding.top + chartH} stroke="var(--border-strong)" strokeWidth="1" />}
                                <circle 
                                    cx={px} cy={py} r={isHovered ? 6 : 0} 
                                    fill="var(--bg-void)" stroke="var(--accent-400)" strokeWidth="2" 
                                    className="transition-all duration-300 pointer-events-none" 
                                />
                                {/* Invisible vertical band for hover trapping cleanly */}
                                <rect 
                                    x={px - (chartW/data.length)/2} y={padding.top} 
                                    width={chartW/data.length} height={chartH} 
                                    fill="transparent" 
                                    onMouseEnter={() => setHoverIdx(i)}
                                    onMouseLeave={() => setHoverIdx(null)}
                                    className="cursor-crosshair cursor-none"
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Floating DOM Tooltip (bypasses SVG bounds easily) */}
            <AnimatePresence>
                {hoverIdx !== null && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={spring.snappy as any}
                        className="absolute z-50 glass-4 p-3 rounded-lg border border-[var(--border-subtle)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-none"
                        style={{ 
                            left: `calc(${(data[hoverIdx].score / 100) * 100}% - 60px)`, 
                            top: `${Math.max(20, (height - padding.bottom) * (1 - (data[hoverIdx].count / maxCount)) - 60)}px` 
                        }}
                    >
                        <div className="flex flex-col gap-1 w-[120px]">
                            <span className="font-mono text-[11px] text-[var(--accent-400)] mb-1">SCORE {data[hoverIdx].score}</span>
                            <div className="flex justify-between items-center">
                                <span className="text-[12px] text-[var(--text-tertiary)]">Teams</span>
                                <span className="font-bold text-white text-[13px]">{data[hoverIdx].count}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[12px] text-[var(--text-tertiary)]">Percentile</span>
                                <span className="text-white text-[13px]">{data[hoverIdx].percentile}th</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};
