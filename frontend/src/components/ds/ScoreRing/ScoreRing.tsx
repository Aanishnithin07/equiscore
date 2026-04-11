// frontend/src/components/ds/ScoreRing/ScoreRing.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { spring as framerSpring } from '../../../lib/motion-config';
import { createSpring } from '../../../lib/spring';
import styles from './ScoreRing.module.css';

export interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function getScoreColor(score: number): string {
  if (score < 50) return 'var(--danger)';      // coral
  if (score < 75) return 'var(--warning)';     // amber
  if (score < 90) return 'var(--success)';     // teal
  return 'oklch(64% 0.180 282)';               // violet (perfect)
}

function getSizeSpecs(size: string) {
  switch (size) {
    case 'sm': return { r: 28, sw: 4 };
    case 'md': return { r: 54, sw: 6 };
    case 'lg': return { r: 82, sw: 8 };
    case 'xl': return { r: 110, sw: 10 };
    default:   return { r: 82, sw: 8 };
  }
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 'lg' }) => {
  const { r, sw } = getSizeSpecs(size);
  const center = r + sw + 2; // +2 for glow padding margin
  const boundingBox = center * 2;
  
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  // Math-driven spring logic updating the DOM number visually
  const numberRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    // 80 stiffness / 20 damping matches spring.slow
    const physics = createSpring({ stiffness: 80, damping: 20, mass: 1.2 });
    physics.setTarget(score);
    
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      
      const currentPos = physics.step(dt);
      if (numberRef.current) {
        numberRef.current.innerText = Math.round(currentPos).toString();
      }
      
      if (!physics.isSettled()) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };
    
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  return (
    <div className={`${styles.ringContainer} ${styles[`size-${size}`]}`}>
      <svg width={boundingBox} height={boundingBox} viewBox={`0 0 ${boundingBox} ${boundingBox}`}>
        <defs>
          <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track */}
        <circle 
          cx={center} cy={center} r={r} 
          className={styles.track} 
          strokeWidth={sw} 
        />
        
        {/* Glow Halo layer (behind main fill) */}
        <motion.circle
          cx={center} cy={center} r={r}
          className={styles.fill}
          strokeWidth={sw}
          stroke={color}
          opacity={0.4}
          filter="url(#ringGlow)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={framerSpring.slow}
          transform={`rotate(-90 ${center} ${center})`}
        />

        {/* Primary sharp stroke */}
        <motion.circle
          cx={center} cy={center} r={r}
          className={styles.fill}
          strokeWidth={sw}
          stroke={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={framerSpring.slow}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      
      <div className={styles.scoreWrapper}>
        <span ref={numberRef} className={styles.scoreText} style={{ color }}>
          0
        </span>
        {size !== 'sm' && <span className={styles.scoreSuffix}>/100</span>}
      </div>
    </div>
  );
};
