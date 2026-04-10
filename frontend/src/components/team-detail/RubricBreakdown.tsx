import React from 'react';
import { motion } from 'framer-motion';
import { RubricScoreDetail } from '../../types/evaluation';

interface Props {
  scores: RubricScoreDetail[];
  overallScore: number; // Used to color match the bars to the global score theme
}

export function RubricBreakdown({ scores, overallScore }: Props) {
  // Determine color matching spec overall theme
  let accentBarColor = 'bg-accent-danger';
  if (overallScore >= 75) accentBarColor = 'bg-accent-secondary';
  else if (overallScore >= 50) accentBarColor = 'bg-accent-warning';

  return (
    <div className="w-full mt-10">
      <h3 className="font-display text-sm tracking-widest text-text-secondary uppercase mb-6 flex items-center">
        <span className="h-px bg-border-subtle flex-1 mr-4"></span>
        Rubric Breakdown
        <span className="h-px bg-border-subtle flex-1 ml-4"></span>
      </h3>

      <div className="space-y-5">
        {scores.map((cat, idx) => {
          const maxRaw = 10;
          const maxWeighted = cat.weight * 100;
          // Fill width = (weighted_score / max_possible_weighted) * 100%
          const fillPercentage = (cat.weighted_score / maxWeighted) * 100;

          return (
            <div key={cat.category} className="flex flex-col space-y-1.5">
              
              {/* Data Row */}
              <div className="flex items-end justify-between px-1">
                <span className="font-body text-[14px] font-medium text-text-primary">
                  {cat.category}
                </span>
                <span className="font-mono text-[13px] text-text-secondary">
                  <span className="text-text-primary">{cat.raw_score}/{maxRaw}</span> 
                  <span className="text-text-tertiary mx-1.5">→</span> 
                  {cat.weighted_score.toFixed(1)}pts
                </span>
              </div>

              {/* Graphical Bar */}
              <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden relative">
                <motion.div
                  className={`absolute top-0 left-0 h-full rounded-full ${accentBarColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(fillPercentage, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.1 * idx, ease: 'easeOut' }}
                />
              </div>

              {/* Metadta hint row */}
              <div className="flex justify-between px-1.5">
                 <span className="text-[11px] text-text-tertiary font-mono">
                    {(cat.weight * 100).toFixed(0)}% WT
                 </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
