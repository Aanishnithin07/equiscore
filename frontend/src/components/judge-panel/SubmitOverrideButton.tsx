import React from 'react';
import { Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJudgeStore } from '../../stores/judgeStore';

export function SubmitOverrideButton() {
  const { isSubmitting, submitOverride, selectedJobId, submittedJobIds } = useJudgeStore();
  
  const isLockedIn = selectedJobId ? submittedJobIds.has(selectedJobId) : false;
  const disabled = !selectedJobId || isSubmitting || isLockedIn;

  return (
    <button
      onClick={submitOverride}
      disabled={disabled}
      className={`
        relative w-full h-12 rounded-xl flex items-center justify-center font-display text-[13px] font-semibold tracking-widest uppercase overflow-hidden cursor-pointer
        transition-all ease-fast duration-fast
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(124,111,247,0.4)]'}
      `}
      style={{
        background: isLockedIn 
          ? 'rgba(0, 212, 170, 0.15)' 
          : 'linear-gradient(135deg, #7C6FF7, #5A52CC)'
      }}
    >
      <AnimatePresence mode="wait">
        {isSubmitting ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center text-white"
          >
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            SAVING...
          </motion.div>
        ) : isLockedIn ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center text-accent-secondary"
          >
            <Check className="w-5 h-5 mr-2" />
            SCORE LOCKED
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white"
          >
            LOCK IN SCORE
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subtle shine effect on hover */}
      {!disabled && (
        <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
      )}
    </button>
  );
}
