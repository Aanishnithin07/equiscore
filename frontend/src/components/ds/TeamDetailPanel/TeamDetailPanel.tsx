// frontend/src/components/ds/TeamDetailPanel/TeamDetailPanel.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ScoreRing } from '../ScoreRing/ScoreRing';
import { RubricBreakdown } from '../RubricBreakdown/RubricBreakdown';
import { StrengthsWeaknesses } from '../StrengthsWeaknesses/StrengthsWeaknesses';
import { JustificationCard } from '../JustificationCard/JustificationCard';
import { SuggestedQnA } from '../SuggestedQnA/SuggestedQnA';
import { BehavioralSection } from '../BehavioralSection/BehavioralSection';
import { useEvaluation } from '../../../hooks/useEvaluation';

// Fallback skeleton structure purely for structural mapping if DB is empty
const MOCK_DATA = {
  rubric: [
    { id: '1', category: 'Technical Complexity', score: 0, maxScore: 10, weightLabel: '30%', justification: 'Pending Evaluation' },
  ],
  strengths: [{ id: '1', text: 'Pending analysis phase...' }],
  weaknesses: [{ id: '1', text: 'Waiting for model readout...' }],
  qna: [{ id: '1', question: 'Analysis pending...', explanation: '', targetWeakness: '' }],
  behavior: {
    score: 0,
    confidence: 0,
    pacing: { problem: 0.2, solution: 0.2, demo: 0.2, team: 0.2, ask: 0.2 },
    fillerWords: []
  }
};

export const TeamDetailPanel: React.FC<{ teamId: string }> = ({ teamId }) => {
  const { data: evaluation } = useEvaluation(teamId);
  const eva = evaluation as any;
  const result = eva?.result;

  const rubric = result?.metrics ? Object.entries(result.metrics).map(([k, v], i) => ({ id: String(i), category: k, score: (v as any).score || 0, maxScore: 10, weightLabel: 'Auto', justification: (v as any).justification || '' })) : MOCK_DATA.rubric;
  const strengths = result?.strengths?.map((s: string, i: number) => ({ id: String(i), text: s })) || MOCK_DATA.strengths;
  const weaknesses = result?.weaknesses?.map((s: string, i: number) => ({ id: String(i), text: s })) || MOCK_DATA.weaknesses;

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
            <h1 className="display-2 text-white mb-2 truncate">{eva?.metadata?.teamInfo || 'Team Analysis'}</h1>
            <span className="microlabel text-[var(--text-tertiary)] mb-6">SUBMITTED RECENTLY · ALGORITHM LIVE</span>
            
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

            <div className="border-l-2 border-l-[var(--accent-400)] pl-4">
              <p className="font-sans text-[14px] italic text-[var(--text-secondary)] leading-relaxed max-w-[90%]">
                "{eva?.metadata?.deckUrl || 'Deep mathematical abstractions evaluating real-time spatial arrays optimally.'}"
              </p>
            </div>
          </div>

          {/* Right Column (40%) */}
          <div className="flex-1 flex flex-col items-center justify-center shrink-0 border-l border-[var(--border-ghost)] pl-8">
            <div className="relative isolate flex flex-col items-center">
              <ScoreRing score={result?.overall_score || 0} size="xl" />
              <div className="mt-4">
                <span className="microlabel text-teal-400/80 tracking-widest text-[10px]">{(result?.overall_score || 0) > 80 ? 'STRONG POTENTIAL' : 'REVIEW NEEDED'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RubricBreakdown items={rubric} />
      <StrengthsWeaknesses strengths={strengths} weaknesses={weaknesses} />
      <JustificationCard text={result?.feedback || "Evaluation parameters parsing through heuristic endpoints natively. Validating structures intrinsically."} />
      <SuggestedQnA questions={MOCK_DATA.qna} />
      <BehavioralSection data={MOCK_DATA.behavior} />

    </motion.div>
  );
};
