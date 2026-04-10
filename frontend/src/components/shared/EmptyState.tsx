import React from 'react';
import { ActivitySquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 bg-background-primary/50">
      <div className="w-20 h-20 rounded-2xl bg-background-surface border border-border-subtle flex items-center justify-center mb-6 shadow-2xl relative">
        <ActivitySquare className="w-10 h-10 text-accent-primary opacity-80" />
        <div className="absolute inset-0 rounded-2xl bg-accent-primary/20 blur-xl -z-10"></div>
      </div>
      <h3 className="font-display font-semibold text-2xl text-text-primary mb-2">
        Judge's Copilot
      </h3>
      <p className="font-body text-text-secondary max-w-sm">
        Select a team from the leaderboard to view their pitch deck's AI evaluation and audit trail.
      </p>
    </div>
  );
}
