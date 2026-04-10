import React from 'react';
import { useJudgeStore } from '../../stores/judgeStore';
import { TrackEnum } from '../../types/evaluation';

export function TrackFilter() {
  const { trackFilter, setTrackFilter, setSelectedJob } = useJudgeStore();

  const handleFilter = (filter: TrackEnum | 'all') => {
    setTrackFilter(filter);
    setSelectedJob(null); // Clear selection when switching lists
  };

  const tabs: { id: TrackEnum | 'all', label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'healthcare', label: 'Health' },
    { id: 'ai_ml', label: 'AI/ML' },
    { id: 'open_innovation', label: 'Open' },
  ];

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border-subtle">
      {tabs.map((tab) => {
        const isActive = trackFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleFilter(tab.id)}
            className={`
              px-3 py-1 rounded-full text-xs font-body font-medium transition-colors ease-fast duration-fast
              ${isActive 
                ? 'bg-accent-primary text-white border-transparent' 
                : 'bg-transparent text-text-secondary border border-border-subtle hover:bg-background-elevated hover:text-text-primary'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
