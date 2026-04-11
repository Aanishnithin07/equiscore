// frontend/src/components/ds/RubricBreakdown/RubricBreakdown.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataBar } from '../DataBar/DataBar';
import { spring } from '../../../lib/motion-config';

export interface RubricScoreItem {
  id: string;
  category: string;
  score: number;
  maxScore: number;
  weightLabel: string;
  justification: string;
}

interface Props {
  items: RubricScoreItem[];
}

export const RubricBreakdown: React.FC<Props> = ({ items }) => {
  return (
    <div className="w-full flex flex-col pt-6">
      <div className="mb-4">
        <span className="microlabel text-[var(--text-tertiary)] tracking-widest">RUBRIC ANALYSIS</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <RubricRow key={item.id} item={item} index={idx} />
        ))}
      </div>
    </div>
  );
};

const RubricRow: React.FC<{ item: RubricScoreItem; index: number }> = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ ...spring.snappy, delay: index * 0.06 } as any}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full glass-1 glass-noise px-5 py-4 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border-default)] transition-colors duration-200 hover:bg-[var(--bg-elevated)]"
    >
      <DataBar 
        category={item.category} 
        score={item.score} 
        maxScore={item.maxScore} 
        weightLabel={item.weightLabel} 
      />
      
      {/* Row 3 Expansion */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 font-sans text-[13px] italic text-[var(--text-tertiary)] leading-relaxed border-t border-[var(--border-ghost)] mt-3">
              "{item.justification}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
