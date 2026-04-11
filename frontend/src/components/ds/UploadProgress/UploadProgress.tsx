// frontend/src/components/ds/UploadProgress/UploadProgress.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  progress: number;
  speedLabel: string;
  remainingLabel: string;
  onCancel: () => void;
}

/**
 * @component UploadProgress
 * @description Renders explicit linear upload metrics bridging network callbacks linearly natively.
 */
export const UploadProgress: React.FC<Props> = ({ progress, speedLabel, remainingLabel, onCancel }) => {
  const radius = 36; // 80px ring (-4 padding)
  const circum = 2 * Math.PI * radius;
  const offset = circum - (progress / 100) * circum;

  return (
    <div className="w-full h-[52px] flex items-center justify-between px-2 animate-[fadeUp_0.4s_ease-out]">
      
      <div className="flex items-center gap-4 flex-1">
        
        {/* Native SVG Ring tracking math limits directly mimicking Framer without overhead */}
        <div className="relative w-[36px] h-[36px] flex items-center justify-center">
            <svg width="36" height="36" className="transform -rotate-90 drop-shadow-[0_0_8px_var(--accent-glow)]">
                <circle cx="18" cy="18" r={radius/2 + 2} stroke="var(--border-subtle)" strokeWidth="3" fill="none" />
                <motion.circle 
                    cx="18" cy="18" r={radius/2 + 2}
                    stroke="var(--accent-400)" strokeWidth="3" fill="none"
                    strokeDasharray={2 * Math.PI * (radius/2 + 2)}
                    animate={{ strokeDashoffset: 2 * Math.PI * (radius/2 + 2) * (1 - progress/100) }}
                    transition={{ ease: "linear", duration: 0.2 }}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[9px] font-bold tracking-tighter">{Math.round(progress)}</span>
            </div>
        </div>

        <div className="flex flex-col">
            <span className="font-sans text-[13px] font-bold text-[var(--text-primary)]">Uploading...</span>
            <span className="font-sans text-[11px] text-[var(--text-tertiary)]">{speedLabel} · {remainingLabel}</span>
        </div>
      </div>

      <button onClick={onCancel} className="text-[12px] font-sans text-coral-400 hover:text-white transition-colors cursor-pointer mr-2 underline decoration-coral-400/30">
        Cancel sequence
      </button>

    </div>
  );
};
