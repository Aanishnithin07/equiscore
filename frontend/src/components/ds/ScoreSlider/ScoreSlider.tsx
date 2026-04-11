// frontend/src/components/ds/ScoreSlider/ScoreSlider.tsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface ScoreSliderProps {
  value: number;
  onChange: (val: number) => void;
  aiScore: number;
}

export const ScoreSlider: React.FC<ScoreSliderProps> = ({ value, onChange, aiScore }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Math mappings
  const getColor = (v: number) => {
    if (v < 50) return 'var(--coral-400)';
    if (v < 75) return 'var(--amber-400)';
    if (v < 90) return 'var(--teal-400)';
    return 'oklch(64% 0.180 282)'; // accent
  };
  const getGlow = (v: number) => {
    if (v < 50) return 'var(--coral-glow)';
    if (v < 75) return 'var(--amber-glow)';
    if (v < 90) return 'var(--teal-glow)';
    return 'var(--accent-glow)';
  };

  const currentColor = getColor(value);
  const currentGlow = getGlow(value);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateValue(e.clientX);
    
    const handlePointerMove = (ev: PointerEvent) => updateValue(ev.clientX);
    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const updateValue = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const newVal = Math.round(percent * 100);
    onChange(newVal);
  };

  // Deltas
  const delta = value - aiScore;
  const deltaStr = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '0';
  const deltaColor = delta > 0 ? 'text-teal-400' : delta < 0 ? 'text-coral-400' : 'text-gray-500';

  return (
    <div className="w-full flex flex-col gap-6 select-none relative pb-4">
      
      {/* Container spacing out the slider to make room for tooltip */}
      <div 
        className="relative w-[calc(100%-24px)] mx-auto h-[6px] rounded-full mt-10 mb-2 cursor-pointer touch-none"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        {/* Visual Track Background */}
        <div className="absolute inset-0 rounded-full w-full h-full bg-gradient-to-r from-[var(--coral-400)] via-[var(--amber-400)] to-[var(--teal-400)] opacity-40 blur-[1px]" />
        <div className="absolute inset-0 rounded-full w-full h-full bg-gradient-to-r from-[var(--coral-400)] via-[var(--amber-400)] to-[var(--teal-400)] opacity-80" />
        
        {/* Active Value Track Overlay (dims the right side natively instead of complex SVGs) */}
        <div className="absolute top-0 right-0 bottom-0 bg-[var(--bg-elevated)] rounded-r-full" style={{ width: `${100 - value}%`, transition: isDragging ? 'none' : 'width 0.1s' }} />

        {/* Floating Readout (Spring) */}
        <motion.div 
            className="absolute top-[-36px] -translate-x-1/2 flex items-center justify-center font-mono font-bold text-[20px]"
            style={{ color: currentColor, left: `${value}%` }}
            animate={{ y: isDragging ? -4 : 0, scale: isDragging ? 1.1 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {value}
        </motion.div>

        {/* Physical Thumb */}
        <motion.div 
            className="absolute top-[3px] -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-white z-10 flex items-center justify-center"
            style={{ 
                left: `${value}%`, 
                border: `3px solid ${currentColor}`,
                boxShadow: `0 2px 8px oklch(0% 0 0 / 0.4), 0 0 0 4px ${currentGlow}`
            }}
            animate={{ scale: isDragging ? 0.95 : isHovered ? 1.15 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {/* Grab indicator lines inside thumb */}
            <div className="w-[8px] h-[8px] flex items-center justify-between">
                <div className="w-[2px] h-full rounded-full opacity-30" style={{ backgroundColor: currentColor }} />
                <div className="w-[2px] h-full rounded-full opacity-30" style={{ backgroundColor: currentColor }} />
            </div>
        </motion.div>
      </div>

      {/* Axis Labels */}
      <div className="w-[calc(100%-24px)] mx-auto flex justify-between relative mt-1">
        {[0, 25, 50, 75, 100].map(mark => (
            <div key={mark} className="flex flex-col items-center absolute -translate-x-1/2" style={{ left: `${mark}%` }}>
                <div className="w-[1px] h-[4px] bg-[var(--text-tertiary)] opacity-30 mb-1" />
                <span className="font-mono text-[9px] text-[var(--text-tertiary)]">{mark}</span>
            </div>
        ))}
      </div>

      {/* Delta Feedback */}
      <div className="w-full flex items-center justify-center mt-6">
        <div className={`glass-1 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] flex items-center gap-2 transition-colors`}>
            <span className="microlabel text-[var(--text-tertiary)] select-none">DELTA vs AI</span>
            <span className={`font-mono text-[14px] font-bold ${deltaColor}`}>{deltaStr}</span>
        </div>
      </div>
    </div>
  );
};
