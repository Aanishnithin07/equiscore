// frontend/src/components/organizer/LiveActivityFeed/LiveActivityFeed.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type EventType = 'submission' | 'evaluation_complete' | 'flag_detected' | 'judge_override';

export interface FeedEvent {
  id: string;
  timestamp: string;
  desc: string;
  team: string;
  type: EventType;
}

interface Props {
  events: FeedEvent[];
}

/**
 * @component LiveActivityFeed
 * @description Auto-scrolling websocket data container drawing live network payloads seamlessly
 * tracking 50-node lifecycles linearly natively.
 */
export const LiveActivityFeed: React.FC<Props> = ({ events }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic mimicking a terminal buffer
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  const getTypeStyle = (type: EventType) => {
    switch (type) {
      case 'flag_detected': return 'border-coral-400 bg-coral-400/5 text-coral-400';
      case 'judge_override': return 'border-amber-400 bg-amber-400/5 text-amber-400';
      case 'evaluation_complete': return 'border-teal-400 bg-teal-400/5 text-teal-400';
      default: return 'border-[var(--accent-400)] bg-accent-400/5 text-[var(--accent-400)]';
    }
  };

  return (
    <div className="w-full h-full glass-1 border border-[var(--border-default)] rounded-[var(--radius-xl)] flex flex-col overflow-hidden max-h-[600px]">
      {/* Header */}
      <div className="h-12 border-b border-[var(--border-ghost)] px-4 flex items-center justify-between shrink-0 bg-[var(--bg-elevated)]/50 backdrop-blur-md">
        <span className="microlabel text-[var(--accent-400)] tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-400)] animate-pulse shadow-[0_0_8px_var(--accent-glow)]" />
            LIVE ACTIVITY
        </span>
        <span className="font-mono text-[9px] text-[var(--text-tertiary)] opacity-60">WSS://BRIDGE</span>
      </div>

      {/* Feed container */}
      <div ref={containerRef} className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col gap-2 scroll-smooth">
        <AnimatePresence initial={false}>
          {events.map((e) => {
            const style = getTypeStyle(e.type);
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: 24, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`w-full flex flex-col p-3 rounded-lg border-l-2 border-y border-r border-y-transparent border-r-transparent ${style} transition-colors`}
              >
                <div className="flex items-center justify-between mb-1">
                    <span className="font-sans font-bold text-[12px] opacity-90 cursor-pointer hover:underline">{e.team}</span>
                    <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{e.timestamp}</span>
                </div>
                <span className="font-sans text-[12px] text-[var(--text-secondary)] leading-tight">{e.desc}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
