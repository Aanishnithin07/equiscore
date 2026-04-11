// frontend/src/components/ds/TrackSelector/TrackSelector.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, HeartPulse, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';
import { spring } from '../../../lib/motion-config';

export interface TrackData {
  id: string;
  name: string;
  description: string;
  type: 'ai' | 'health' | 'open';
}

interface Props {
  tracks: TrackData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * @component TrackSelector
 * @description Exposes exclusive evaluation metrics selection targeting distinct ML pipelines natively.
 */
export const TrackSelector: React.FC<Props> = ({ tracks, selectedId, onSelect }) => {
  const getStyle = (type: 'ai' | 'health' | 'open', isSelected: boolean) => {
    switch (type) {
      case 'health': return { color: 'var(--teal-400)', border: isSelected ? 'border-teal-400' : 'border-[var(--border-subtle)]', bg: isSelected ? 'bg-teal-400/10' : 'glass-1', glow: 'var(--teal-glow)' };
      case 'open': return { color: 'var(--amber-400)', border: isSelected ? 'border-amber-400' : 'border-[var(--border-subtle)]', bg: isSelected ? 'bg-amber-400/10' : 'glass-1', glow: 'var(--amber-glow)' };
      default: return { color: 'var(--accent-400)', border: isSelected ? 'border-accent-400' : 'border-[var(--border-subtle)]', bg: isSelected ? 'bg-accent-400/10' : 'glass-1', glow: 'var(--accent-glow)' };
    }
  };

  const getIcon = (type: string, color: string) => {
    if (type === 'health') return <HeartPulse size={24} color={color} />;
    if (type === 'open') return <Lightbulb size={24} color={color} />;
    return <BrainCircuit size={24} color={color} />;
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        transition={spring.bouncy as any}
        className="w-full flex flex-col pt-6 overflow-visible"
    >
      <span className="microlabel text-[var(--text-tertiary)] tracking-widest mb-3" id="track-label">SELECT YOUR TRACK</span>
      
      <div className="flex gap-4 w-full" role="radiogroup" aria-labelledby="track-label">
        {tracks.map(t => {
          const isSelected = selectedId === t.id;
          const s = getStyle(t.type, isSelected);
          
          return (
            <motion.button
              key={t.id}
              role="radio"
              aria-checked={isSelected}
              whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(t.id)}
              transition={spring.snappy as any}
              style={isSelected ? { boxShadow: `0 0 20px ${s.glow}` } : {}}
              className={`
                flex-1 h-[80px] rounded-[var(--radius-lg)] border ${s.border} ${s.bg} p-3 flex flex-col justify-center relative overflow-hidden transition-colors cursor-pointer text-left focus:outline-none
              `}
            >
              <div className="flex items-center gap-3 relative z-10 w-full pr-6">
                <div className="shrink-0">{getIcon(t.type, s.color)}</div>
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-sans font-bold text-[14px] text-white truncate">{t.name}</span>
                    <span className="font-sans text-[11px] text-[var(--text-tertiary)] leading-tight mt-[1px] line-clamp-2">{t.description}</span>
                </div>
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={spring.bouncy as any}
                    className="absolute top-2 right-2 z-10"
                  >
                    <CheckCircle2 size={16} color={s.color} fill={s.color} className="text-[var(--bg-void)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-4 px-1" role="alert">
        <AlertTriangle size={12} className="text-amber-400 shrink-0 mb-[1px]" />
        <span className="font-sans text-[11px] text-amber-400 opacity-90">
          Your submission is evaluated exclusively against the rubric of the track you select.
        </span>
      </div>
    </motion.div>
  );
};
