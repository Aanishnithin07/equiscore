// frontend/src/components/ds/SuggestedQnA/SuggestedQnA.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown } from 'lucide-react';
import { spring } from '../../../lib/motion-config';
import { Badge } from '../Badge/Badge';

export interface QnAItem {
  id: string;
  question: string;
  explanation: string;
  targetWeakness: string;
}

interface Props {
  questions: QnAItem[];
}

export const SuggestedQnA: React.FC<Props> = ({ questions }) => {
  return (
    <div className="w-full flex flex-col mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={12} className="text-[var(--text-tertiary)]" />
        <span className="microlabel text-[var(--text-tertiary)] tracking-widest leading-none">SUGGESTED Q&A</span>
      </div>

      <div className="flex flex-col gap-2">
        {questions.map((q, idx) => (
          <QnAAccordion key={q.id} item={q} index={idx} />
        ))}
      </div>
    </div>
  );
};

const QnAAccordion: React.FC<{ item: QnAItem; index: number }> = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isPrimary = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ ...spring.bouncy, delay: index * 0.08 } as any} // Staggered slideInRight
      className={`
        glass-1 w-full rounded-[var(--radius-md)] border-y-[0.5px] border-r-[0.5px] border-l-[3px] 
        ${isPrimary ? 'border-l-[var(--accent-400)] border-y-transparent border-r-transparent' : 'border-l-[var(--border-subtle)] border-[var(--border-default)]'}
        overflow-hidden transition-colors duration-200 hover:bg-[var(--bg-elevated)] cursor-pointer
      `}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* Header Row (Always visible, min-height 52px) */}
      <div className="min-h-[52px] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[var(--accent-400)] bg-opacity-15 flex items-center justify-center shrink-0">
            <span className="text-[var(--accent-400)] font-sans font-bold text-[12px] select-none">?</span>
          </div>
          <span className="font-sans text-[14px] font-medium text-[var(--text-primary)] select-none">
            {item.question}
          </span>
        </div>
        
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }} 
          transition={spring.snappy as any}
          className="text-[var(--text-tertiary)] shrink-0 ml-4"
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>

      {/* Expandable Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.snappy as any}
          >
            <div className="px-4 pb-4 pt-1 flex flex-col gap-3">
              <div className="w-full h-[1px] bg-[var(--border-ghost)]" />
              <p className="font-sans text-[13px] text-[var(--text-secondary)] italic leading-relaxed">
                {item.explanation}
              </p>
              <div>
                <Badge variant="danger" size="sm" className="opacity-90 tracking-wide text-[8px]">
                  TARGETS: {item.targetWeakness.toUpperCase()}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
