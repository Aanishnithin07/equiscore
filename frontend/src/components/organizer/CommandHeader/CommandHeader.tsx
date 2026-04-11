// frontend/src/components/organizer/CommandHeader/CommandHeader.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../ds/Badge/Badge';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { spring } from '../../../lib/motion-config';
import { Button } from '../../ds/Button/Button';

// Mock Stage Data for UI
export type HackathonStage = 'setup' | 'registration_open' | 'evaluating' | 'results_published';

interface Props {
  hackathonName: string;
  currentStage: HackathonStage;
  onAdvanceStage: (newStage: HackathonStage) => void;
}

const STAGES = [
  { id: 'setup', label: 'Setup', desc: 'Configuring rubric and tracks.' },
  { id: 'registration_open', label: 'Registration Open', desc: 'Teams can join and submit decks.' },
  { id: 'evaluating', label: 'Evaluating', desc: 'AI evaluating, Judges overriding.' },
  { id: 'results_published', label: 'Results Published', desc: 'Teams can see rankings & score.' },
];

/**
 * @component CommandHeader
 * @description The highest level of authority in the app. Includes mesh-card glassmorphism
 * and intricate popover state management natively avoiding arbitrary z-index conflicts.
 */
export const CommandHeader: React.FC<Props> = ({ hackathonName, currentStage, onAdvanceStage }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getStatusBadge = () => {
    switch (currentStage) {
      case 'setup': return <Badge variant="neutral">Setup Phase</Badge>;
      case 'results_published': return <Badge variant="success">Completed</Badge>;
      default: return <Badge variant="warning" className="motion-safe:animate-pulse">Live Event</Badge>;
    }
  };

  const currentIndex = STAGES.findIndex(s => s.id === currentStage);
  const nextStage = STAGES[currentIndex + 1];

  return (
    <div className="w-full h-24 glass-3 mesh-card px-8 flex items-center justify-between border-b border-[var(--border-subtle)] relative z-40">
      <div className="flex items-center gap-4">
        <h2 className="heading-2 text-white font-['Sora'] drop-shadow-md">{hackathonName}</h2>
        {getStatusBadge()}
      </div>

      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            h-10 px-4 glass-1 border rounded-full flex items-center gap-3 transition-colors
            ${isOpen ? 'border-[var(--accent-400)] bg-[var(--accent-400)]/10 text-white shadow-[0_0_15px_var(--accent-glow)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'}
          `}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-400)] animate-pulse" />
            <span className="font-sans font-medium text-[13px]">{STAGES[currentIndex]?.label || 'Unknown'}</span>
          </div>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={spring.snappy as any}>
            <ChevronDown size={14} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Invisible backdrop to close popover */}
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={spring.bouncy as any}
                className="absolute right-0 top-[calc(100%+12px)] w-[360px] glass-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 p-6 flex flex-col"
              >
                <span className="microlabel text-[var(--text-tertiary)] mb-4">EVENT PIPELINE</span>
                
                <div className="flex flex-col relative w-full mb-6">
                  {STAGES.map((s, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;
                    const isFuture = idx > currentIndex;
                    
                    return (
                      <div key={s.id} className="flex relative w-full mb-2 min-h-[48px]">
                        {idx !== STAGES.length - 1 && (
                          <div className="absolute left-[9px] top-[24px] bottom-[-16px] w-[2px] bg-[var(--border-ghost)]">
                            {isCompleted && <div className="absolute inset-0 bg-teal-400" />}
                          </div>
                        )}
                        
                        <div className="shrink-0 mt-1 z-10 w-5 transition-transform origin-center">
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-teal-400 flex items-center justify-center">
                              <span className="text-[var(--bg-void)] text-[10px] font-bold">✓</span>
                            </div>
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full border-2 border-[var(--accent-400)] flex items-center justify-center shadow-[0_0_8px_var(--accent-glow)]">
                              <div className="w-2 h-2 rounded-full bg-[var(--accent-400)] animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-[var(--border-strong)] bg-[var(--bg-void)]" />
                          )}
                        </div>
                        
                        <div className={`ml-4 flex flex-col pb-4 ${isFuture ? 'opacity-50' : ''}`}>
                          <span className={`font-sans font-bold text-[14px] ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{s.label}</span>
                          <span className="font-sans text-[11px] text-[var(--text-tertiary)] leading-tight mt-1">{s.desc}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {nextStage && (
                  <Button 
                    variant="primary" 
                    className="w-full flex items-center gap-2 justify-center"
                    onClick={() => {
                        onAdvanceStage(nextStage.id as HackathonStage);
                        setIsOpen(false);
                    }}
                  >
                    ADVANCE TO {nextStage.label.toUpperCase()} <ArrowRight size={16} />
                  </Button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
