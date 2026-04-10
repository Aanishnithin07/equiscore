import React from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number; // 0 to 100
}

export function ScoreRing({ score }: ScoreRingProps) {
  // SVG Mathematics
  const radius = 78; // 180 diameter / 2 minus padding for stroke
  const circumference = 2 * Math.PI * radius;
  
  // Calculate dash offset for filling the ring based on score
  // Since we want the animation to *fill up*, strokeDashoffset goes from CIRC to CIRC * (1 - score / 100)
  const targetDashOffset = circumference * (1 - score / 100);

  // Determine color matching spec: <50 red, 50-74 amber, 75+ teal
  let strokeColor = '#FF6B6B'; // Correlates to tailwind accent-danger
  if (score >= 75) strokeColor = '#00D4AA'; // accent-secondary
  else if (score >= 50) strokeColor = '#FFB347'; // accent-warning

  return (
    <div className="relative flex items-center justify-center w-[180px] h-[180px]">
      
      {/* SVG Container wrapping the rings */}
      <svg
        className="absolute w-full h-full transform -rotate-90"
        viewBox="0 0 180 180"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Track Ring */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="12"
          fill="none"
        />
        
        {/* Foreground Animated Score Ring */}
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          stroke={strokeColor}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round" // Round edges
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetDashOffset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} // custom ease-out-cubic equivalent
        />
      </svg>

      {/* Central Numeric Value */}
      <div className="absolute inset-0 flex items-center justify-center flex-col mt-1">
        <div className="flex items-baseline">
          <motion.span 
            className="font-mono text-5xl font-bold tracking-tighter"
            style={{ color: strokeColor }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {score}
          </motion.span>
          <span className="font-mono text-xl text-text-tertiary ml-0.5">/100</span>
        </div>
      </div>
      
    </div>
  );
}
