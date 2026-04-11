// frontend/src/components/ds/ProcessingTimeline/ProcessingTimeline.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, XCircle } from 'lucide-react';
import { spring } from '../../../lib/motion-config';

export type ProcessStepStatus = 'pending' | 'active' | 'done' | 'failed';

export interface ProcessStep {
  id: string;
  label: string;
  sublabel: string;
  status: ProcessStepStatus;
}

interface Props {
  steps: ProcessStep[];
  estimatedSecondsLeft?: number;
}

/**
 * @component ProcessingTimeline
 * @description Renders real-time WebSocket derived pipeline statuses translating pipeline nodes 
 * sequentially exposing custom gradient connecting spans concurrently.
 */
export const ProcessingTimeline: React.FC<Props> = ({ steps, estimatedSecondsLeft }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Only run elapsed timer if we have active/pending steps left
    if (!steps.some(s => s.status === 'active')) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [steps]);

  // Determine global state
  const isFailed = steps.some(s => s.status === 'failed');
  const isDone = steps.every(s => s.status === 'done');

  return (
    <div className="w-full flex flex-col pt-2 animate-[fadeUp_0.4s_ease-out]">
      <div className="flex flex-col relative w-full mb-6 max-w-md mx-auto">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const isActive = step.status === 'active';
          
          return (
            <div key={step.id} className="flex relative w-full mb-1 group">
              {/* Vertical connecting line */}
              {!isLast && (
                <div className="absolute left-[11px] top-[26px] bottom-[-22px] w-[2px] bg-[var(--border-subtle)] overflow-hidden">
                  <motion.div 
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: step.status === 'done' ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "linear" }}
                    className="w-full h-full bg-gradient-to-b from-teal-400 to-accent-400 origin-top"
                  />
                </div>
              )}

              {/* Status Node */}
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 relative z-10 transition-colors bg-[var(--bg-void)]">
                {step.status === 'done' ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-full h-full rounded-full bg-teal-400 flex items-center justify-center shadow-[0_0_12px_var(--teal-glow)]">
                    <Check size={14} className="text-[var(--bg-void)]" strokeWidth={3} />
                  </motion.div>
                ) : step.status === 'failed' ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-full h-full rounded-full bg-coral-400 flex items-center justify-center shadow-[0_0_12px_var(--coral-glow)]">
                    <XCircle size={14} className="text-[var(--bg-void)]" />
                  </motion.div>
                ) : step.status === 'active' ? (
                  <div className="w-full h-full rounded-full border-[2px] border-[var(--accent-400)] flex items-center justify-center shadow-[0_0_12px_var(--accent-glow)]">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-full h-full rounded-full border-t-2 border-transparent border-[var(--accent-400)]" />
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-[var(--border-strong)]" />
                )}
              </div>

              {/* Labels */}
              <div 
                className={`flex flex-col ml-4 pb-4 flex-1 transition-all duration-300 rounded-[var(--radius-md)] px-3 -my-1 py-2
                  ${isActive ? 'bg-[var(--accent-400)] bg-opacity-[0.03] shadow-[inset_2px_0_0_var(--accent-400)]' : 'hover:bg-[var(--bg-elevated)]'}
                `}
              >
                <span className={`font-sans font-bold text-[14px] transition-colors ${isActive ? 'text-white' : step.status === 'done' ? 'text-[var(--text-secondary)]' : step.status === 'failed' ? 'text-coral-400' : 'text-[var(--text-tertiary)]'}`}>
                  {step.label}
                </span>
                <span className="font-sans text-[12px] text-[var(--text-tertiary)] leading-tight">{step.sublabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full h-[1px] bg-[var(--border-subtle)] mb-4" />
      
      <div className="flex items-center justify-between px-2 w-full max-w-md mx-auto">
        <div className="flex items-center gap-2">
            {!isDone && !isFailed && <Loader2 size={14} className="text-[var(--accent-400)] animate-spin" />}
            <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                {isFailed ? "Processing halted." : isDone ? "Complete" : `Estimated ~${estimatedSecondsLeft || 25} seconds`}
            </span>
        </div>
        <span className="font-mono text-[11px] text-[var(--text-tertiary)]">Elapsed: {elapsed}s</span>
      </div>
    </div>
  );
};
