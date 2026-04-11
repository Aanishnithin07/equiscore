// frontend/src/components/ds/DigitalCountdown/DigitalCountdown.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DigitalCountdownProps {
  /** Target ending absolute UNIX timestamp (ms) */
  targetTimeMs: number; 
}

/**
 * @component DigitalCountdown
 * @description High-tension digital flip-clock equivalent ensuring physical stakes tracking deadlines seamlessly.
 * Includes native color shifting and shake thresholds natively.
 */
export const DigitalCountdown: React.FC<DigitalCountdownProps> = ({ targetTimeMs }) => {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  let diff = Math.max(0, targetTimeMs - now);
  const isExpired = diff === 0;

  const getUrgencyLevel = () => {
    if (diff < 3600000) return 'critical'; // < 1hr => coral + shake
    if (diff < 86400000) return 'warning'; // < 24hr => amber
    return 'normal';
  };

  const urgency = getUrgencyLevel();
  const theme = {
    normal: { text: 'text-white', glow: 'var(--accent-glow)' },
    warning: { text: 'text-amber-400', glow: 'var(--amber-glow)' },
    critical: { text: 'text-coral-400', glow: 'var(--coral-glow)' }
  }[urgency];

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * 1000 * 60 * 60;
  const mins = Math.floor(diff / (1000 * 60));
  diff -= mins * 1000 * 60;
  const secs = Math.floor(diff / 1000);

  const format = (n: number) => n.toString().padStart(2, '0');

  const Block: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className={`relative flex flex-col items-center ${urgency === 'critical' && !isExpired ? 'motion-safe:animate-[shake_1s_ease-in-out_infinite]' : ''}`}>
      <div 
        className="glass-1 w-[52px] h-[60px] rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden transition-all duration-300"
        style={(!isExpired && urgency !== 'normal') ? { boxShadow: `0 0 15px ${theme.glow}` } : {}}
      >
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[var(--border-ghost)] z-10 opacity-50" />
        <AnimatePresence mode="popLayout">
            <motion.span 
                key={value}
                initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.2 }}
                className={`font-mono text-[28px] font-bold z-20 ${theme.text}`}
            >
                {isExpired ? '00' : value}
            </motion.span>
        </AnimatePresence>
      </div>
      <span className="microlabel text-[var(--text-tertiary)] mt-2 block w-full text-center tracking-[0.15em]">{label}</span>
    </div>
  );

  const Colon = () => (
    <div className="flex flex-col gap-2 mt-4 motion-safe:animate-pulse">
      <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-gray-600' : 'bg-[var(--accent-400)]'} shadow-[0_0_8px_var(--accent-glow)]`} />
      <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-gray-600' : 'bg-[var(--accent-400)]'} shadow-[0_0_8px_var(--accent-glow)]`} />
    </div>
  );

  return (
    <div className="relative isolate" aria-label={`Countdown timer: ${days} days, ${hours} hours, ${mins} minutes left.`}>
        <div className="flex items-start gap-3">
          <Block value={format(days)} label="DAYS" />
          <Colon />
          <Block value={format(hours)} label="HRS" />
          <Colon />
          <Block value={format(mins)} label="MINS" />
          <Colon />
          <Block value={format(secs)} label="SECS" />
        </div>
        
        {isExpired && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-void/60 backdrop-blur-sm rounded-[var(--radius-lg)]"
            >
                <div className="glass-3 border border-coral-400/50 px-4 py-2 rounded shadow-[0_0_20px_var(--coral-glow)]">
                    <span className="font-['Sora'] font-bold text-coral-400 tracking-wider">SUBMISSION CLOSED</span>
                </div>
            </motion.div>
        )}
    </div>
  );
};
