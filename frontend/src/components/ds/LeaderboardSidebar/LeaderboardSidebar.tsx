// frontend/src/components/ds/LeaderboardSidebar/LeaderboardSidebar.tsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { LeaderboardItem, LeaderboardItemSkeleton, TeamLeaderboardData } from '../LeaderboardItem/LeaderboardItem';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  teams: TeamLeaderboardData[];
  isLoading?: boolean;
  selectedTeamId?: string;
  onSelectTeam: (id: string) => void;
}

const TRACKS = ['All', 'Healthcare', 'AI/ML', 'Open'];

export const LeaderboardSidebar: React.FC<Props> = ({ 
  teams, 
  isLoading, 
  selectedTeamId, 
  onSelectTeam 
}) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredTeams = teams.filter(t => {
    if (filter !== 'All' && !t.track.toLowerCase().includes(filter.toLowerCase())) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <aside className="w-[300px] h-[calc(100dvh-56px)] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col shrink-0 relative z-20">
      
      {/* HEADER SECTION (sticky) */}
      <div className="h-[120px] shrink-0 pt-4 px-4 pb-0 flex flex-col z-10 border-b border-[var(--border-ghost)] bg-[var(--bg-surface)] shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="microlabel text-[var(--text-tertiary)]">LEADERBOARD</span>
          <span className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] px-1.5 py-0.5 rounded font-bold font-sans">
            {teams.length} teams
          </span>
        </div>

        {/* Track filter pills */}
        <div className="flex gap-1.5 w-full mb-3">
          {TRACKS.map(t => {
            const isActive = filter === t;
            return (
              <motion.button
                key={t}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(t)}
                className={`
                  flex-1 py-1 rounded text-[11px] font-sans transition-colors duration-200
                  ${isActive 
                    ? 'bg-[var(--accent-400)] text-white font-medium' 
                    : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--text-tertiary)]'
                  }
                `}
              >
                {t}
              </motion.button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative group w-full mb-2">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-400)] transition-colors" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[32px] glass-1 pl-8 pr-3 rounded border border-[var(--border-subtle)] text-[13px] font-sans text-white focus:border-[var(--accent-400)] focus:shadow-[var(--glow-accent)] outline-none transition-all"
          />
        </div>
      </div>

      {/* ITEMS LIST (Virtual scroll concept manually mapped natively since lists are bounded heavily) */}
      <div className="flex-1 overflow-y-auto w-full pb-12 relative">
        {isLoading ? (
          <>
            {[0, 150, 300].map((delay, idx) => (
              <LeaderboardItemSkeleton key={idx} delayMs={delay} />
            ))}
          </>
        ) : filteredTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[var(--text-tertiary)] font-sans text-[13px]">
            No teams match your complex search.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredTeams.map(team => (
              <motion.div
                key={team.id}
                layoutId={`team-card-${team.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                <LeaderboardItem
                  team={team}
                  isSelected={selectedTeamId === team.id}
                  onSelect={() => onSelectTeam(team.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
};
