import React, { useMemo } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { TrackFilter } from './TrackFilter';
import { LeaderboardItem } from './LeaderboardItem';

export function LeaderboardSidebar() {
  const { data, isLoading, isError } = useLeaderboard();

  // For visual prototyping we will render skeletons while loading
  const renderSkeletons = () => (
    <div className="flex flex-col animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-border-subtle flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-background-elevated rounded"></div>
            <div className="flex flex-col space-y-2">
              <div className="w-24 h-4 bg-background-elevated rounded"></div>
              <div className="w-16 h-2 bg-background-elevated rounded"></div>
            </div>
          </div>
          <div className="w-8 h-6 bg-background-elevated rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-surface">
      {/* Fixed Sticky Header */}
      <div className="sticky top-0 z-10 bg-background-surface/80 backdrop-blur-md border-b border-border-subtle pt-6">
        <div className="px-5 pb-3 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 -mx-5 px-10">
          <h2 className="font-display font-[700] text-xs tracking-[0.15em] text-text-secondary mb-1">
            LEADERBOARD
          </h2>
          <div className="font-mono text-2xl font-bold text-text-primary">
            {isLoading ? '--' : data?.total_count || 0}
            <span className="font-body text-xs text-text-tertiary font-normal ml-2 tracking-normal">
              TEAMS SCORED
            </span>
          </div>
        </div>
        <TrackFilter />
      </div>

      {/* Scrollable Virtual / Flow List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {isLoading && renderSkeletons()}
        
        {isError && (
          <div className="p-6 text-center text-accent-danger text-sm">
            Unable to fetch leaderboard. Retrying...
          </div>
        )}

        {!isLoading && !isError && data?.entries.length === 0 && (
          <div className="p-8 text-center text-text-tertiary text-sm">
            No evaluations found for this track.
          </div>
        )}

        {!isLoading && !isError && data?.entries.map((entry) => (
          <LeaderboardItem 
            key={entry.team_name} 
            entry={entry} 
            // In a real API response, each entry should hold its evaluation root job_id. We mock it with team name here for routing.
            mockJobId={`job-${entry.team_name.replace(/\s+/g, '-').toLowerCase()}`} 
          />
        ))}
      </div>
    </div>
  );
}
