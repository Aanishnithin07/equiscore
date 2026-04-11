// frontend/src/components/ds/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { TopBar } from '../TopBar/TopBar';
import { LeaderboardSidebar } from '../LeaderboardSidebar/LeaderboardSidebar';
import { ToastSystem } from '../Toast/ToastSystem';
import { CommandPalette } from '../CommandPalette/CommandPalette';
import { CursorFollower } from '../CursorFollower/CursorFollower';
import { PageProgress } from '../PageProgress/PageProgress';
import { TeamLeaderboardData } from '../LeaderboardItem/LeaderboardItem';
import { JudgeOverridePanel } from '../JudgeOverridePanel/JudgeOverridePanel';
import { TeamDetailPanel } from '../TeamDetailPanel/TeamDetailPanel';
import { EmptyState } from '../EmptyState/EmptyState';
import { AnimatePresence } from 'framer-motion';

// MOCK DATA FOR DEMO
const DEMO_TEAMS: TeamLeaderboardData[] = [
  { id: '1', rank: 1, previousRank: 2, name: 'NeuralHeal', track: 'Healthcare', score: 94, status: 'completed' },
  { id: '2', rank: 2, previousRank: 1, name: 'QuantumFinance', track: 'Open', score: 89, status: 'completed' },
  { id: '3', rank: 3, previousRank: 3, name: 'VisionAI', track: 'AI/ML', score: 85, status: 'processing' },
  { id: '4', rank: 4, previousRank: 6, name: 'EcoTrack', track: 'Open', score: 81, status: 'completed' },
  { id: '5', rank: 5, previousRank: 4, name: 'MediChain', track: 'Healthcare', score: 72, status: 'failed' },
  { id: '6', rank: 6, previousRank: 5, name: 'DataSynthesizer', track: 'AI/ML', score: 68, status: 'completed' },
  { id: '7', rank: 7, previousRank: 7, name: 'SmartGrid', track: 'Open', score: 45, status: 'completed' },
];

/**
 * Super Sandbox Shell framing the three columns structurally natively.
 */
export const Dashboard: React.FC = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();

  return (
    <div className="flex w-full h-[100dvh] overflow-hidden bg-[var(--bg-void)] relative font-sans">
      <div className="mesh-primary" />
      
      <div className="flex flex-col w-full h-full relative z-10">
        <TopBar />
        
        <div className="flex flex-1 w-full relative">
          <LeaderboardSidebar 
            teams={DEMO_TEAMS} 
            selectedTeamId={selectedTeamId} 
            onSelectTeam={setSelectedTeamId} 
          />
          
          {/* Main Stage (1fr, min 560px) */}
          <main className="flex-1 min-w-[560px] h-[calc(100dvh-56px)] overflow-y-auto relative p-8 pb-32">
            <AnimatePresence mode="wait">
                {selectedTeamId ? (
                    <TeamDetailPanel key={selectedTeamId} teamId={selectedTeamId} />
                ) : (
                    <EmptyState />
                )}
            </AnimatePresence>
          </main>
          
          {/* Judge Panel Column (320px) */}
          <JudgeOverridePanel />
        </div>
      </div>
      
      {/* Global Overlays */}
      <ToastSystem />
      <CommandPalette />
      <CursorFollower />
      <PageProgress />
    </div>
  );
};
