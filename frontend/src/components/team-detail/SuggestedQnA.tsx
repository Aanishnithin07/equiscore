import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  questions: string[];
}

export function SuggestedQnA({ questions }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Take max 5 questions as per spec
  const displayQnA = questions.slice(0, 5);

  if (displayQnA.length === 0) return null;

  return (
    <div className="w-full mt-10">
      <h3 className="font-display text-[13px] font-semibold tracking-wide text-text-primary mb-5 flex items-center">
        <MessageSquare className="w-4 h-4 mr-2 text-accent-primary" />
        AI-SUGGESTED QUESTIONS FOR THIS TEAM
      </h3>

      <div className="space-y-2">
        {displayQnA.map((q, idx) => {
          const isExpanded = expandedIdx === idx;
          
          return (
            <div 
              key={`q-${idx}`}
              className="border border-border-subtle bg-background-surface/50 rounded-xl overflow-hidden transition-colors hover:bg-background-elevated line-clamp-none"
            >
              <button
                className="w-full px-5 py-3.5 flex items-start justify-between text-left focus:outline-none focus:shadow-focus"
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              >
                <div className="flex items-start flex-1 pr-4">
                  <HelpCircle className="w-4 h-4 text-accent-secondary mt-[3px] mr-3 flex-shrink-0" />
                  <span className={`font-body text-[14px] ${isExpanded ? 'font-medium text-text-primary' : 'text-text-primary/90'}`}>
                    {q}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-0.5 flex-shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-text-tertiary" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 pt-1 ml-7 flex">
                       <div className="w-0.5 bg-border-subtle mr-4"></div>
                       <p className="font-body text-[13px] text-text-secondary leading-relaxed italic">
                         This question targets a potential gap in their technical execution or validation claims based on the AI's rubric evaluation. Listen closely to how well they substantiate their response.
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
