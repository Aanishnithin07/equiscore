import React from 'react';
import { useJudgeStore } from '../../stores/judgeStore';
import { useEvaluation } from '../../hooks/useEvaluation';
import { Badge } from '../shared/Badge';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorBoundary } from '../shared/ErrorBoundary';

// Sub-components
import { ScoreRing } from './ScoreRing';
import { RubricBreakdown } from './RubricBreakdown';
import { StrengthsWeaknesses } from './StrengthsWeaknesses';
import { JustificationCard } from './JustificationCard';
import { SuggestedQnA } from './SuggestedQnA';
import { Target, Flag } from 'lucide-react';

export function TeamDetailPanel() {
  const selectedJobId = useJudgeStore(state => state.selectedJobId);
  const { data: evaluation, isLoading, isError } = useEvaluation(selectedJobId);

  // No team selected state
  if (!selectedJobId) {
    return <EmptyState />;
  }

  // Loading state
  if (isLoading || !evaluation) {
    return <LoadingSpinner />;
  }

  // API Error state
  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-accent-danger text-sm">Failed to load evaluation details. Please try again.</p>
      </div>
    );
  }

  // In processing
  if (evaluation.status === 'pending' || evaluation.status === 'processing') {
    return (
      <div className="h-full p-12 flex flex-col items-center justify-center text-center">
         <Badge type="status" value={evaluation.status} className="mb-6 scale-125" />
         <h2 className="text-2xl font-display font-semibold text-text-primary mb-2">Analyzing Pitch Deck...</h2>
         <p className="text-text-secondary max-w-md text-sm">
           The AI is currently evaluating {evaluation.team_name}'s submission against the {evaluation.track} rubric. This usually takes about 30 seconds.
         </p>
      </div>
    );
  }

  // Failed evaluate
  if (evaluation.status === 'failed') {
      return (
        <div className="h-full p-12 flex flex-col items-center justify-center text-center">
           <Badge type="status" value={evaluation.status} className="mb-6 scale-125" />
           <h2 className="text-2xl font-display font-semibold text-text-primary mb-2">Evaluation Failed</h2>
           <p className="text-accent-danger max-w-md text-sm p-4 bg-accent-danger/10 border border-accent-danger/20 rounded-lg mt-4 font-mono">
             {evaluation.error || "Unknown extraction error."}
           </p>
        </div>
      );
  }

  // Destructure safe result assuming status is completed
  const result = evaluation.result;
  if (!result) return null; // Edge case protection

  // Formatting timestamp
  const submittedTimeStr = new Date(evaluation.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'});

  return (
    <ErrorBoundary>
      <div className="px-10 py-12 max-w-5xl mx-auto space-y-12 pb-32">
        
        {/* 1. TEAM HEADER */}
        <header className="flex flex-col items-center text-center border-b border-border-subtle pb-8">
          <div className="flex items-center space-x-3 mb-4">
             <Badge type="track" value={evaluation.track} />
             <Badge type="status" value={evaluation.status} />
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-3">
             {evaluation.team_name}
          </h1>
          <p className="font-mono text-xs text-text-tertiary">
            EVAL JOB: {evaluation.job_id.substring(0,8)} • SUBMITTED {submittedTimeStr}
          </p>
        </header>

        {/* 2. SCORE RING SECTION */}
        <section className="flex flex-col items-center space-y-6">
           <div className="relative">
             <ScoreRing score={result.overall_score} />
           </div>
           
           <div className="max-w-xl text-center group cursor-help">
             <p className="font-body text-[14px] text-text-secondary italic flex items-center justify-center line-clamp-2 transition-colors group-hover:text-text-primary">
               <Target className="w-4 h-4 mr-2 text-accent-primary flex-shrink-0" />
               "{result.track_alignment}"
             </p>
           </div>
        </section>

        {/* 3. DISQUALIFICATION FLAGS (if any) */}
        {result.disqualification_flags?.length > 0 && (
          <section className="bg-accent-danger/10 border border-accent-danger/20 rounded-xl p-5">
             <h4 className="flex items-center font-display text-sm font-semibold text-accent-danger mb-3">
               <Flag className="w-4 h-4 mr-2" /> WARNING SIGNS DETECTED
             </h4>
             <ul className="list-disc pl-5 space-y-1">
               {result.disqualification_flags.map((flag, i) => (
                 <li key={i} className="text-sm font-body text-text-primary/90">{flag}</li>
               ))}
             </ul>
          </section>
        )}

        {/* 4. RUBRIC BREAKDOWN */}
        <section>
          <RubricBreakdown scores={result.rubric_scores} overallScore={result.overall_score} />
        </section>

        {/* 5. STRENGTHS & WEAKNESSES */}
        <section className="pt-6">
          <StrengthsWeaknesses strengths={result.strengths} weaknesses={result.weaknesses} />
        </section>

        {/* 6. JUSTIFICATION CARD */}
        <section>
           <JustificationCard text={result.rubric_justification} />
        </section>

        {/* 7. Q&A */}
        <section>
           <SuggestedQnA questions={result.suggested_judge_questions} />
        </section>

      </div>
    </ErrorBoundary>
  );
}
