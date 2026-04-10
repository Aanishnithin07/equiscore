import React from 'react';
import { AppShell } from '../components/layout/AppShell';
import { LeaderboardSidebar } from '../components/leaderboard/LeaderboardSidebar';
import { TeamDetailPanel } from '../components/team-detail/TeamDetailPanel';
import { JudgeOverridePanel } from '../components/judge-panel/JudgeOverridePanel';

export function Dashboard() {
  return (
    <AppShell
      leaderboard={<LeaderboardSidebar />}
      mainPanel={<TeamDetailPanel />}
      overridePanel={<JudgeOverridePanel />}
    />
  );
}
