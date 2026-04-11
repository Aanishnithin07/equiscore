// frontend/src/components/ds/DataBar/DataBar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../../lib/motion-config';
import styles from './DataBar.module.css';

export interface DataBarProps {
  category: string;
  score: number;
  maxScore?: number;
  weightLabel?: string;
}

function getScoreColor(percent: number): string {
  if (percent < 0.5) return 'var(--danger)';      // coral
  if (percent < 0.75) return 'var(--warning)';    // amber
  if (percent < 0.9) return 'var(--success)';     // teal
  return 'oklch(64% 0.180 282)';                  // violet (perfect)
}

function hexToOpacity(baseVar: string, opacityHex: string): string {
    // If it's a CSS Variable, we'll construct a custom glow by injecting the box-shadow implicitly in styles
    return `${baseVar}`;
}

export const DataBar: React.FC<DataBarProps> = ({ 
  category, 
  score, 
  maxScore = 10,
  weightLabel
}) => {
  const percent = Math.min(Math.max(score / maxScore, 0), 1);
  const color = getScoreColor(percent);
  
  return (
    <div className={styles.barContainer}>
      <div className={styles.header}>
        <div className={styles.labelGroup}>
          <span className={styles.categoryName}>{category}</span>
          {weightLabel && <span className={styles.weightLabel}>({weightLabel})</span>}
        </div>
        <div className={styles.scoreFraction} style={{ color }}>
          {score}/{maxScore}
        </div>
      </div>
      
      <div className={styles.track}>
        <motion.div 
          className={styles.fill}
          style={{ 
            color,
            boxShadow: `0 0 8px ${color}` // Fallback approach leveraging color string inheritance natively
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent * 100}%` }}
          transition={spring.snappy}
        />
      </div>
    </div>
  );
};
