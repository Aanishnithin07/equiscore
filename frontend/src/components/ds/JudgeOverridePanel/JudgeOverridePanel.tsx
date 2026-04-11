// frontend/src/components/ds/JudgeOverridePanel/JudgeOverridePanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../Toast/useToast';
import { ScoreSlider } from '../ScoreSlider/ScoreSlider';
import { useMagnetic } from '../../../lib/magnetic';

export const JudgeOverridePanel: React.FC = () => {
  const [aiScore] = useState(72);
  const [humanScore, setHumanScore] = useState(aiScore);
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lockState, setLockState] = useState<'idle' | 'loading' | 'success' | 'locked'>('idle');
  
  const toast = useToast();
  const magRef = useMagnetic(0.6);

  // Auto-save typing simulator
  useEffect(() => {
    if (notes.length === 0 && saveStatus === 'idle') return;
    setSaveStatus('saving');
    const t = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 600);
    return () => clearTimeout(t);
  }, [notes]);

  const finalScore = Math.round((aiScore + humanScore) / 2);
  const getScoreColor = (v: number) => {
    if (v < 50) return 'var(--coral-400)';
    if (v < 75) return 'var(--amber-400)';
    if (v < 90) return 'var(--teal-400)';
    return 'oklch(64% 0.180 282)';
  };

  const handleLock = () => {
    if (lockState === 'locked' || lockState === 'success') {
      toast.info('Score already submitted');
      return;
    }
    
    setLockState('loading');
    setTimeout(() => {
      setLockState('success');
      toast.success('Successfully locked final score', { description: `Recorded ${finalScore} points to cluster.`});
      setTimeout(() => setLockState('locked'), 2000);
      
      // Pseudo-confetti
      triggerConfetti();
    }, 1500);
  };

  const triggerConfetti = () => {
      // (Optional simple DOM injection for confetti - omitted to keep code strict, relies on Toast natively instead)
  };

  const isLocked = lockState === 'locked' || lockState === 'success';

  return (
    <aside className="w-[320px] h-[calc(100dvh-56px)] bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] shrink-0 overflow-y-auto shadow-[-20px_0_40px_rgba(0,0,0,0.1)] pb-12 relative z-20">
      
      {/* JUDGE IDENTITY HEADER */}
      <div className="p-6 border-b border-[var(--border-ghost)] bg-[var(--bg-elevated)] sticky top-0 z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full shadow-md flex items-center justify-center bg-gradient-to-br from-[var(--accent-400)] to-[var(--teal-400)] border border-white/10 shrink-0">
          <span className="font-['Sora'] text-[16px] font-bold text-white leading-none">DK</span>
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-sans text-[14px] font-medium text-[var(--text-primary)] leading-tight">JUDGE — Dev K.</h3>
          <span className="text-[10px] text-[var(--text-tertiary)] font-sans mt-0.5">Session since 14:00</span>
        </div>
      </div>

      {/* AI SCORE DISPLAY */}
      <div className="p-6 pb-4 flex flex-col items-center">
        <span className="microlabel text-[var(--text-tertiary)] tracking-widest mb-2 block">AI PRE-SCORE</span>
        <div className="flex items-end gap-1 leading-none mb-3">
            <span className="font-mono text-[48px] font-bold" style={{ color: getScoreColor(aiScore) }}>{aiScore}</span>
            <span className="font-mono text-[16px] text-[var(--text-tertiary)] mb-1.5">/100</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--text-inverse)]">
            <span className="text-[9px] font-bold text-[var(--text-tertiary)] tracking-wide">Powered by EquiScore AI</span>
        </div>
      </div>

      {/* SEPARATOR */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-400)] to-[var(--teal-400)] opacity-30 my-2" />

      {/* HUMAN OVERRIDE */}
      <div className="p-6 pb-2">
        <span className="microlabel text-[var(--text-tertiary)] tracking-widest mb-6 block text-center">YOUR OVERRIDE</span>
        <ScoreSlider value={humanScore} onChange={(v) => !isLocked && setHumanScore(v)} aiScore={aiScore} />
      </div>

      {/* NOTES TEXTAREA */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-2">
            <span className="microlabel text-[var(--text-tertiary)] tracking-widest">LIVE IMPRESSIONS</span>
            {saveStatus === 'saving' && <span className="text-[10px] text-[var(--text-tertiary)] italic">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-[10px] text-teal-400 italic">Saved ✓</span>}
        </div>
        <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLocked}
            className="w-full glass-1 border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-3 outline-none text-[13px] font-sans text-white resize-none h-[110px] focus:border-[var(--accent-400)] focus:shadow-[var(--glow-accent)] transition-all placeholder:text-[var(--text-disabled)]"
            placeholder="What do you see that the AI can't?"
        />
        <div className="flex justify-end mt-1">
            <span className={`text-[10px] font-mono ${notes.length >= 480 ? 'text-coral-400' : notes.length >= 400 ? 'text-amber-400' : 'text-[var(--text-tertiary)]'}`}>
                {notes.length}/500
            </span>
        </div>
      </div>

      {/* FINAL SCORE COMPUTATION */}
      <div className="px-6 py-4 flex flex-col items-center">
        <span className="microlabel text-[var(--text-tertiary)] tracking-widest mb-3 block">FINAL SCORE</span>
        
        <div className="bg-[var(--bg-surface)] px-4 py-2 rounded-full border border-[var(--border-ghost)] flex items-center justify-center gap-1.5 mb-4 shadow-inner">
            <span className="text-[10px] font-sans text-[var(--text-tertiary)]">AI</span>
            <span className="text-[12px] font-mono font-bold" style={{ color: getScoreColor(aiScore) }}>{aiScore}</span>
            <span className="text-[10px] font-sans text-[var(--text-tertiary)] mx-0.5">+</span>
            <span className="text-[10px] font-sans text-[var(--text-tertiary)]">You</span>
            <span className="text-[12px] font-mono font-bold" style={{ color: getScoreColor(humanScore) }}>{humanScore}</span>
            <span className="text-[12px] font-sans text-[var(--text-tertiary)] mx-1">÷</span>
            <span className="text-[12px] font-mono text-[var(--text-tertiary)]">2</span>
        </div>

        <motion.div 
            key={finalScore} // triggers animation on change
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="font-mono text-[42px] font-bold leading-none tabular-nums" 
            style={{ color: getScoreColor(finalScore) }}
        >
            {finalScore}
        </motion.div>
      </div>

      {/* LOCK IN BUTTON */}
      <div className="px-6 mt-4 relative h-[52px] flex justify-center">
        <button
            ref={magRef as any}
            onClick={handleLock}
            className={`
                h-[52px] rounded-[var(--radius-lg)] font-['Sora'] text-[13px] font-semibold tracking-[0.1em] uppercase relative overflow-hidden transition-all duration-300
                ${isLocked ? 'w-full bg-teal-400/20 border-teal-400/40 text-[var(--teal-400)] cursor-default' : lockState === 'loading' ? 'w-[52px] bg-[var(--accent-400)] text-transparent cursor-wait' : 'w-full bg-[var(--accent-400)] text-white shadow-[var(--glow-accent)] hover:-translate-y-[2px]'}
            `}
            style={!isLocked && lockState !== 'loading' ? { background: 'linear-gradient(180deg, oklch(68% 0.180 282), var(--accent-400))', border: '0.5px solid oklch(100% 0 0 / 0.2)' } : {}}
            data-magnetic="true"
        >
            <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${lockState === 'idle' ? 'opacity-100' : 'opacity-0'}`}>
                LOCK IN SCORE
            </span>

            {lockState === 'loading' && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                </span>
            )}

            {(lockState === 'success' || lockState === 'locked') && (
                <span className="absolute inset-0 flex items-center justify-center opacity-100 text-teal-400 font-bold drop-shadow-md">
                    LOCKED ✓
                </span>
            )}
        </button>
      </div>
      
    </aside>
  );
};
