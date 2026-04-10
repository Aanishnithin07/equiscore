import React, { ReactNode } from 'react';
import { TopBar } from './TopBar';

interface AppShellProps {
  leaderboard: ReactNode;
  mainPanel: ReactNode;
  overridePanel: ReactNode;
}

export function AppShell({ leaderboard, mainPanel, overridePanel }: AppShellProps) {
  return (
    <div className="h-screen w-screen flex flex-col bg-background-primary overflow-hidden">
      {/* Fixed top nav bar */}
      <TopBar />
      
      {/* 
        Main layout grid as per spec: 
        280px (sidebar) | 1fr (center panel) | 320px (right panel)
        Each inner column controls its own overflow scrolling.
      */}
      <main className="flex-1 grid grid-cols-[280px_1fr_320px] overflow-hidden">
        <aside className="h-full overflow-y-auto border-r border-border-subtle bg-background-surface/30 custom-scrollbar">
          {leaderboard}
        </aside>
        
        <section className="h-full overflow-y-auto relative custom-scrollbar bg-background-primary">
          {mainPanel}
        </section>
        
        <aside className="h-full overflow-y-auto border-l border-border-subtle bg-background-surface/80 shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-10 custom-scrollbar">
          {overridePanel}
        </aside>
      </main>
    </div>
  );
}
