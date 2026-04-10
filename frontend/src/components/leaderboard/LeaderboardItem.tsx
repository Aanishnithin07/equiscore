import React from 'react';
import { LeaderboardEntry } from '../../types/evaluation';
import { useJudgeStore } from '../../stores/judgeStore';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  // This is the job ID we'd fetch the detailed evaluation with. 
  // Normally the API should return a job_id with the leaderboard payload.
  // We'll mock it for now based on the team name to ensure consistent linking.
  mockJobId: string;
}

export function LeaderboardItem({ entry, mockJobId }: LeaderboardItemProps) {
  const { selectedJobId, setSelectedJob, submittedJobIds } = useJudgeStore();
  const isSelected = selectedJobId === mockJobId;
  const isLockedIn = submittedJobIds.has(mockJobId);

  // Score color interpolation mapping based on design spec
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-accent-secondary'; // Teal for 75+
    if (score >= 50) return 'text-accent-warning'; // Amber for 50-74
    return 'text-accent-danger'; // Coral for < 50
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-accent-primary font-bold';
    return 'text-text-tertiary';
  };

  const trackBadgeColors = {
    healthcare: 'bg-accent-secondary/50',
    ai_ml: 'bg-accent-primary/50',
    open_innovation: 'bg-accent-warning/50'
  };

  return (
    <button
      onClick={() => setSelectedJob(mockJobId, entry.overall_score)}
      className={`
        w-full text-left px-5 py-4 border-b border-border-subtle flex items-center justify-between
        transition-all ease-fast duration-fast
        ${isSelected 
          ? 'bg-accent-primary/10 border-l-[3px] border-l-accent-primary pl-[17px]' 
          : 'hover:bg-white/[0.02] border-l-[3px] border-l-transparent'
        }
      `}
    >
      <div className="flex items-center space-x-4 overflow-hidden">
        {/* Rank Number */}
        <span className={`font-mono text-xl ${getRankColor(entry.rank)} w-8 flex-shrink-0`}>
          #{entry.rank}
        </span>
        
        {/* Main Details */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center space-x-2">
            <span className="font-body font-medium text-[15px] truncate max-w-[140px] text-text-primary">
              {entry.team_name}
            </span>
            {isLockedIn && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" title="Score locked in" />
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${trackBadgeColors[entry.track]}`}></div>
            <span className="text-[10px] uppercase tracking-wider text-text-secondary truncate">
              {entry.track.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Score Readout component */}
      <div className={`font-mono text-lg font-semibold ${getScoreColor(entry.overall_score)}`}>
        {entry.overall_score}
      </div>
    </button>
  );
}
