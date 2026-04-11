// frontend/src/components/ds/LeaderboardItem/LeaderboardItem.tsx
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, AlertCircle } from 'lucide-react';
import { spring } from '../../../lib/motion-config';
import { createSpring } from '../../../lib/spring';

export type TeamStatus = 'completed' | 'processing' | 'failed';

export interface TeamLeaderboardData {
  id: string;
  rank: number;
  previousRank?: number;
  name: string;
  track: string; // 'Healthcare' | 'AI/ML' | 'Open' | etc.
  score: number;
  status: TeamStatus;
}

interface Props {
  team: TeamLeaderboardData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const LeaderboardItemSkeleton: React.FC<{ delayMs?: number }> = ({ delayMs = 0 }) => {
  return (
    <div className="h-[68px] px-4 flex items-center border-[0.5px] border-transparent border-b-[var(--border-ghost)]">
      <div className="w-6 h-6 mr-3 skeleton rounded" style={{ animationDelay: `${delayMs}ms` }} />
      <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="w-24 h-4 skeleton rounded" style={{ animationDelay: `${delayMs}ms` }} />
        <div className="w-12 h-3 skeleton rounded" style={{ animationDelay: `${delayMs}ms` }} />
      </div>
      <div className="w-10 h-8 skeleton rounded ml-4" style={{ animationDelay: `${delayMs}ms` }} />
    </div>
  );
};

export const LeaderboardItem: React.FC<Props> = ({ team, isSelected, onSelect }) => {
  const { rank, previousRank, name, track, score, status } = team;
  
  const rankDelta = previousRank ? previousRank - rank : 0;
  
  const getRankStyle = () => {
    if (rank === 1) return { color: 'var(--amber-400)', icon: <Trophy size={12} className="text-amber-400 mb-[2px]" /> };
    if (rank === 2) return { color: '#B0B0C0', icon: <Medal size={12} color="#B0B0C0" className="mb-[2px]" /> };
    if (rank === 3) return { color: 'var(--coral-400)', opacity: 0.8, icon: <Medal size={12} color="var(--coral-400)" opacity={0.8} className="mb-[2px]" /> };
    return { color: 'var(--text-tertiary)' };
  };
  
  const rStyle = getRankStyle();

  const getScoreColor = (s: number) => {
    if (s < 50) return 'var(--danger)';
    if (s < 75) return 'var(--warning)';
    if (s < 90) return 'var(--success)';
    return 'oklch(64% 0.180 282)'; // accent
  };
  
  const scColor = getScoreColor(score);

  const getTrackColor = (t: string) => {
    if (t.toLowerCase().includes('health')) return 'bg-teal-400/10 text-teal-400 border-teal-400/20';
    if (t.toLowerCase().includes('ai')) return 'bg-accent-400/10 text-accent-400 border-accent-400/20';
    return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
  };

  const getStatusDot = () => {
    if (status === 'completed') return <div className="w-1 h-1 rounded-full bg-teal-400 mr-[6px] shrink-0" />;
    if (status === 'processing') return <div className="w-1 h-1 rounded-full border border-amber-400 mr-[6px] shrink-0 animate-spin" style={{ borderTopColor: 'transparent' }} />;
    return <div className="w-1 h-1 rounded-full bg-coral-400 mr-[6px] shrink-0" />;
  };

  // Animate the mini score bar locally via raw physics without fighting React arrays continuously
  const barRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!barRef.current) return;
    const physics = createSpring({ stiffness: 280, damping: 26, mass: 1 }); // spring.snappy
    physics.setTarget(score);
    let id: number;
    let lt = performance.now();
    const tick = (now: number) => {
      const dt = (now - lt) / 1000;
      lt = now;
      const v = physics.step(dt);
      if (barRef.current) barRef.current.style.width = `${(v / 100) * 32}px`;
      if (!physics.isSettled()) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [score]);

  return (
    <motion.div 
      initial={isSelected ? { x: 32, opacity: 0 } : false}
      animate={isSelected ? { x: 0, opacity: 1 } : false}
      transition={spring.snappy as any}
      onClick={onSelect}
      className={`
        relative h-[68px] px-4 flex items-center cursor-pointer select-none transition-colors duration-150 ease-out border-b-[0.5px] border-[var(--border-ghost)]
        ${isSelected 
          ? 'glass-2 !border-b-transparent' 
          : 'hover:bg-[var(--bg-elevated)]'}
      `}
      data-cursor="pointer"
    >
      {isSelected && (
        <motion.div 
          layoutId="leaderboard-active-border" 
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ backgroundColor: 'var(--accent-400)' }}
        />
      )}

      {/* RANK COLUMN (32px) */}
      <div className="w-8 flex flex-col items-center justify-center shrink-0 font-mono text-[14px] font-bold" style={{ color: rStyle.color, opacity: rStyle.opacity || 1 }}>
        {rStyle.icon}
        <span className="leading-none select-none">{rank}</span>
        {rankDelta !== 0 && (
          <span className={`text-[9px] mt-[2px] ${rankDelta > 0 ? 'text-teal-400' : 'text-coral-400'}`}>
            {rankDelta > 0 ? '▲' : '▼'}{Math.abs(rankDelta)}
          </span>
        )}
      </div>

      {/* TEAM INFO (flex-1) */}
      <div className="flex-1 min-w-0 pr-3 flex flex-col justify-center translate-x-3">
        <div className="flex items-center">
          {getStatusDot()}
          <span className="font-sans text-[14px] font-medium text-[var(--text-primary)] truncate">
            {name}
          </span>
        </div>
        <div className="mt-[2px] ml-[10px]">
          <span className={`inline-block border text-[9px] font-bold px-1.5 py-[1px] rounded uppercase tracking-wider leading-none ${getTrackColor(track)}`}>
            {track}
          </span>
        </div>
      </div>

      {/* SCORE COLUMN (56px right aligned) */}
      <div className="w-14 shrink-0 flex flex-col items-end justify-center">
        <span className="font-mono text-[18px] font-bold leading-none" style={{ color: scColor }}>
          {score}
        </span>
        <div className="w-[32px] h-[3px] bg-[var(--bg-elevated)] rounded-full mt-1.5 overflow-hidden">
          <div ref={barRef} className="h-full rounded-full" style={{ backgroundColor: scColor, width: 0 }} />
        </div>
      </div>
    </motion.div>
  );
};
