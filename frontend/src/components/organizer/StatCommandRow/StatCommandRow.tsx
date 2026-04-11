// frontend/src/components/organizer/StatCommandRow/StatCommandRow.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Activity, AlertTriangle } from 'lucide-react';

export interface StatSpec {
  id: string;
  label: string;
  value: number | string;
  trendDir: 'up' | 'down' | 'none';
  trendText: string;
  accent: 'teal' | 'amber' | 'coral' | 'accent';
  icon: React.ElementType;
}

interface Props {
  stats: StatSpec[];
}

/**
 * @component StatCommandRow
 * @description Translates massive mathematical integers into prominent visual nodes natively tracking hover states
 * mapping localized glows organically.
 */
export const StatCommandRow: React.FC<Props> = ({ stats }) => {

  const getColors = (accent: string) => {
    switch (accent) {
      case 'amber': return { text: 'text-amber-400', glow: 'var(--amber-glow)', bg: 'from-amber-400/20' };
      case 'coral': return { text: 'text-coral-400', glow: 'var(--coral-glow)', bg: 'from-coral-400/20' };
      case 'teal': return { text: 'text-teal-400', glow: 'var(--teal-glow)', bg: 'from-teal-400/20' };
      default: return { text: 'text-[var(--accent-400)]', glow: 'var(--accent-glow)', bg: 'from-[var(--accent-400)]/20' };
    }
  };

  const getTrendColor = (dir: string, accent: string) => {
    if (dir === 'up') return accent === 'coral' ? 'text-coral-400' : 'text-teal-400';
    if (dir === 'down') return accent === 'coral' ? 'text-teal-400' : 'text-coral-400';
    return 'text-[var(--text-tertiary)]';
  };

  return (
    <div className="w-full flex gap-4 h-[140px]">
      {stats.map((stat, i) => {
        const c = getColors(stat.accent);
        const Icon = stat.icon;
        const trendIcon = stat.trendDir === 'up' ? '↑' : stat.trendDir === 'down' ? '↓' : '-';
        const isAlerting = stat.accent === 'coral' && typeof stat.value === 'number' && stat.value > 0;

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: `0 10px 40px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.1)` }}
            className={`
                flex-1 glass-2 rounded-[var(--radius-xl)] border border-[var(--border-default)] p-5 flex flex-col justify-between relative overflow-hidden group transition-all duration-300
                ${isAlerting ? 'border-coral-400/50 shadow-[0_0_20px_var(--coral-glow)] motion-safe:animate-[pulse_3s_ease-in-out_infinite]' : ''}
            `}
          >
            {/* Background Ambient Icon */}
            <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-300`}>
                <Icon size={120} />
            </div>

            {/* Top gradient blur for extra depth */}
            <div className={`absolute top-0 left-0 right-0 h-16 bg-gradient-to-b ${c.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10 w-full flex flex-col justify-between h-full">
                <span className={`microlabel ${c.text}`}>{stat.label}</span>
                
                <div className="w-full flex flex-col justify-end mt-auto">
                    <span className="font-mono text-[48px] font-bold text-white leading-none tracking-tighter mb-2 shadow-sm">
                        {stat.value}
                    </span>
                    <span className={`font-sans text-[11px] font-bold ${getTrendColor(stat.trendDir, stat.accent)} tracking-wide transition-colors flex items-center gap-1`}>
                        {stat.trendDir !== 'none' && <span>{trendIcon}</span>}
                        {stat.trendText}
                    </span>
                </div>
            </div>

          </motion.div>
        );
      })}
    </div>
  );
};
