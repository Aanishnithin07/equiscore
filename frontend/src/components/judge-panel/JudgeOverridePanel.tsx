import React, { useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { useJudgeStore } from '../../stores/judgeStore';
import { useEvaluation } from '../../hooks/useEvaluation';
import { ScoreSlider } from './ScoreSlider';
import { SubmitOverrideButton } from './SubmitOverrideButton';

export function JudgeOverridePanel() {
  const { 
    selectedJobId, 
    humanOverrideScore, 
    setHumanScore, 
    judgeNotes, 
    setNotes,
    submittedJobIds
  } = useJudgeStore();

  const { data: evaluation } = useEvaluation(selectedJobId);
  const isLockedIn = selectedJobId ? submittedJobIds.has(selectedJobId) : false;

  // The base AI score to compare against
  const aiScore = evaluation?.result?.overall_score || 0;
  
  // Calculate delta
  const delta = humanOverrideScore - aiScore;
  const deltaText = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0';
  const deltaColor = delta > 0 ? 'text-accent-secondary' : delta < 0 ? 'text-accent-danger' : 'text-text-tertiary';

  // Average final score
  const finalScore = aiScore > 0 ? ((aiScore + humanOverrideScore) / 2).toFixed(1) : parseFloat(humanOverrideScore.toString()).toFixed(1);

  // If no job selected, or job isn't completed, this panel shouldn't be interactable.
  const isInteractable = !!selectedJobId && evaluation?.status === 'completed';

  return (
    <div className="flex flex-col h-full bg-background-surface/80 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-8">
        <div>
          <h2 className="font-display text-sm font-semibold text-text-primary tracking-widest uppercase">
            Judge Override
          </h2>
          <p className="font-mono text-xs text-text-tertiary mt-1">LIVE PITCH STAGE</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-background-elevated border border-border-subtle flex items-center justify-center text-text-secondary">
           <UserCircle className="w-5 h-5" />
        </div>
      </div>

      <div className={`flex flex-col flex-1 ${!isInteractable ? 'opacity-40 pointer-events-none' : ''}`}>
        
        {/* AI Control Readout */}
        <div className="flex justify-between items-end mb-6">
           <span className="font-body text-sm font-medium text-text-secondary">AI Pre-Score</span>
           <span className="font-mono text-3xl font-bold text-text-primary">{aiScore > 0 ? aiScore : '--'}</span>
        </div>

        {/* Human Override Slider Component */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="font-body text-sm font-medium text-text-primary">Your Score Override</span>
            <div className="flex items-baseline space-x-2">
               <span className={`font-mono text-[11px] font-bold ${deltaColor} tracking-wider bg-white/5 px-2 py-0.5 rounded`}>
                 {deltaText}
               </span>
               <span className="font-mono text-4xl font-bold text-accent-primary">{humanOverrideScore}</span>
            </div>
          </div>
          <ScoreSlider 
             value={humanOverrideScore} 
             onChange={(val) => !isLockedIn && setHumanScore(val)} 
          />
        </div>

        {/* Private Notes Context */}
        <div className="flex flex-col mb-8">
          <label className="font-body text-sm font-medium text-text-secondary mb-2 flex justify-between items-end">
            Judge's Private Notes
            <span className={`text-xs ${judgeNotes.length >= 500 ? 'text-accent-danger' : 'text-text-tertiary'}`}>
              {judgeNotes.length}/500
            </span>
          </label>
          <textarea
             value={judgeNotes}
             onChange={(e) => {
               if(!isLockedIn && e.target.value.length <= 500) setNotes(e.target.value);
             }}
             placeholder="What did you observe during the live pitch that the AI couldn't see?"
             className="w-full text-sm font-body bg-background-primary border border-border-subtle rounded-xl p-4 resize-none h-32 focus:outline-none focus:shadow-focus text-text-primary placeholder:text-text-tertiary custom-scrollbar"
             disabled={isLockedIn}
          />
        </div>

        {/* Spacer to push checkout bottom */}
        <div className="flex-1"></div>

        {/* Final Formula Output */}
        <div className="border border-border-subtle rounded-xl p-5 mb-5 bg-background-elevated shadow-inner text-center">
           <span className="block font-display text-[10px] tracking-widest text-text-secondary mb-2 uppercase">Official Final Score</span>
           <div className="font-mono text-5xl font-bold text-white mb-2">
             {finalScore}
           </div>
           <div className="text-[11px] font-mono text-text-tertiary bg-black/20 p-1.5 rounded inline-block">
             (AI: {aiScore} + You: {humanOverrideScore}) ÷ 2
           </div>
        </div>

        <SubmitOverrideButton />
      </div>

    </div>
  );
}
