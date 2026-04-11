// frontend/src/components/ds/StrengthsWeaknesses/StrengthsWeaknesses.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Check } from 'lucide-react';

interface Point {
  id: string;
  text: string;
}

interface Props {
  strengths: Point[];
  weaknesses: Point[];
}

export const StrengthsWeaknesses: React.FC<Props> = ({ strengths, weaknesses }) => {
  return (
    <div className="w-full flex gap-4 mt-8">
      {/* Strengths Column */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-4">
          <TrendingUp size={12} className="text-teal-400" />
          <span className="microlabel text-teal-400 tracking-widest">STRENGTHS</span>
        </div>
        
        <div className="flex flex-col gap-2 relative">
            <div className="absolute -left-[1px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-teal-400/50 via-teal-400/10 to-transparent" />
            {strengths.map((str, idx) => (
            <motion.div
                key={str.id}
                initial={{ opacity: 0, y: 12, x: -8 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group glass-1 px-4 py-3 border-l-[2px] border-l-teal-400 border-y-transparent border-r-transparent rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)] transition-colors duration-200"
            >
                <div className="flex items-start gap-2">
                <Check size={14} className="text-teal-400 shrink-0 mt-[2px]" />
                <p className="font-sans text-[13px] text-[var(--text-secondary)] leading-[1.6] group-hover:text-[var(--text-primary)] transition-colors">
                    {str.text}
                </p>
                </div>
            </motion.div>
            ))}
        </div>
      </div>

      {/* Weaknesses Column */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 mb-4">
          <TrendingDown size={12} className="text-coral-400" />
          <span className="microlabel text-coral-400 tracking-widest">GROWTH AREAS</span>
        </div>
        
        <div className="flex flex-col gap-2 relative">
            <div className="absolute -left-[1px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-coral-400/50 via-coral-400/10 to-transparent" />
            {weaknesses.map((weak, idx) => (
            <motion.div
                key={weak.id}
                initial={{ opacity: 0, y: 12, x: 8 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group glass-1 px-4 py-3 border-l-[2px] border-l-coral-400 border-y-transparent border-r-transparent rounded-[var(--radius-md)] hover:bg-[var(--bg-elevated)] transition-colors duration-200 relative overflow-hidden"
            >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-coral-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <p className="font-sans text-[13px] text-[var(--text-secondary)] leading-[1.6] group-hover:text-[var(--text-primary)] transition-colors ml-1">
                    {weak.text}
                </p>
            </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};
