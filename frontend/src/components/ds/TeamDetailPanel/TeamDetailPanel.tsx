// frontend/src/components/ds/TeamDetailPanel/TeamDetailPanel.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ScoreRing } from '../ScoreRing/ScoreRing';
import { RubricBreakdown } from '../RubricBreakdown/RubricBreakdown';
import { StrengthsWeaknesses } from '../StrengthsWeaknesses/StrengthsWeaknesses';
import { JustificationCard } from '../JustificationCard/JustificationCard';
import { SuggestedQnA } from '../SuggestedQnA/SuggestedQnA';
import { BehavioralSection } from '../BehavioralSection/BehavioralSection';

// MOCK DATA GENERATOR FOR DEMO PURPOSES
const MOCK_DATA = {
  rubric: [
    { id: '1', category: 'Technical Complexity', score: 9.5, maxScore: 10, weightLabel: '30%', justification: 'Implemented a novel distributed consensus algorithm bypassing standard Raft overheads.' },
    { id: '2', category: 'Market Potential', score: 7.0, maxScore: 10, weightLabel: '25%', justification: 'Addressable market is substantial, but go-to-market strategy lacks differentiation.' },
    { id: '3', category: 'UI / UX Polish', score: 8.5, maxScore: 10, weightLabel: '20%', justification: 'Spatial UI components execute flawlessly natively. Exceptionally premium.' },
  ],
  strengths: [
    { id: '1', text: 'Exceptionally deep technical stack avoiding boilerplate.' },
    { id: '2', text: 'Architectural blueprints validate 100k TPS loads natively.' },
    { id: '3', text: 'Stunning visual execution.' }
  ],
  weaknesses: [
    { id: '1', text: 'Pricing model assumes infinite runway.' },
    { id: '2', text: 'Pitch delivery rushed over core value proposition.' }
  ],
  qna: [
    { id: '1', question: 'How do you plan to acquire your first 1,000 paid MAUs without VC subsidies?', explanation: 'The team failed to explain customer acquisition costs organically during the main deck presentation.', targetWeakness: 'Pricing Model' },
    { id: '2', question: 'What happens when your primary LLM endpoint degrades globally?', explanation: 'Given their heavy reliance on deep inferencing, failover state handling must be verified manually.', targetWeakness: 'Technical Risk' }
  ],
  behavior: {
    score: 87,
    confidence: 94,
    pacing: { problem: 0.15, solution: 0.45, demo: 0.25, team: 0.05, ask: 0.10 },
    fillerWords: [{ word: 'um', count: 18 }, { word: 'basically', count: 12 }, { word: 'like', count: 8 }, { word: 'literally', count: 4 }]
  }
};

export const TeamDetailPanel: React.FC<{ teamId: string }> = ({ teamId }) => {
  return (
    <motion.div 
      key={teamId} // This triggers crossfade in AnimatePresence implicitly
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col pb-24"
    >
      {/* HERO SECTION */}
      <div className="w-full glass-2 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border-default)] relative overflow-hidden accent-top mb-12 shadow-md">
        <div className="mesh-card opacity-60" />
        
        <div className="p-8 flex items-center justify-between relative z-10">
          
          {/* Left Column (60%) */}
          <div className="flex flex-col w-[60%] shrink-0 pr-8">
            <h1 className="display-2 text-white mb-2 truncate">Global Ledger AI</h1>
            <span className="microlabel text-[var(--text-tertiary)] mb-6">SUBMITTED 14:32 · 12 SLIDES</span>
            
            {/* Status Row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="glass-1 border-[0.5px] border-teal-400/30 px-2 py-1 rounded-[var(--radius-sm)] flex items-center gap-1.5 shadow-[0_0_8px_var(--teal-glow)]">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span className="text-[9px] font-bold font-sans text-teal-400 tracking-wider">AI EVALUATED</span>
              </div>
              <div className="glass-1 border-[0.5px] border-accent-400/30 px-2 py-1 rounded-[var(--radius-sm)] flex items-center gap-1.5 shadow-[0_0_8px_var(--accent-glow)]">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                <span className="text-[9px] font-bold font-sans text-accent-400 tracking-wider">BEHAVIOR ANALYZED</span>
              </div>
            </div>

            {/* Track alignment quote */}
            <div className="border-l-2 border-l-[var(--accent-400)] pl-4">
              <p className="font-sans text-[14px] italic text-[var(--text-secondary)] leading-relaxed max-w-[90%]">
                "We fundamentally believe existing consensus engines are broken. We rebuilt everything implicitly leveraging spatial inference structures."
              </p>
            </div>
          </div>

          {/* Right Column (40%) */}
          <div className="flex-1 flex flex-col items-center justify-center shrink-0 border-l border-[var(--border-ghost)] pl-8">
            <div className="relative isolate flex flex-col items-center">
              <ScoreRing score={85} size="xl" />
              <div className="mt-4">
                <span className="microlabel text-teal-400/80 tracking-widest text-[10px]">STRONG POTENTIAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RubricBreakdown items={MOCK_DATA.rubric} />
      <StrengthsWeaknesses strengths={MOCK_DATA.strengths} weaknesses={MOCK_DATA.weaknesses} />
      <JustificationCard text="Based on the comprehensive tensor heuristics and behavioral telemetry mapping standard deviations across prior winners objectively, this applicant exhibits profound alignment with the Open AI vertical uniquely. While pricing assumptions bear unmitigated friction inherently, technical architectures scale globally safely. A lock-in score of 85 maps statistical baselines accordingly." />
      <SuggestedQnA questions={MOCK_DATA.qna} />
      <BehavioralSection data={MOCK_DATA.behavior} />

    </motion.div>
  );
};
