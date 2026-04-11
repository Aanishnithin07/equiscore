// frontend/src/components/ds/TopBar/TopBar.tsx
import React, { useState, useEffect } from 'react';
import { Command } from 'lucide-react';
import { Badge } from '../Badge/Badge';

export const TopBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 w-full h-[56px] z-[50] glass-2 border-b border-[var(--border-subtle)] flex items-center justify-between px-4">
      {/* Left zone (240px conceptually, mapped flex) */}
      <div className="flex items-center gap-3 w-[240px] flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Custom E= SVG Logo implicitly building gradients */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-400)" />
                <stop offset="100%" stopColor="var(--teal-400)" />
              </linearGradient>
            </defs>
            <path d="M4 6H12M4 12H12M4 18H20M14 6H20M14 12H20" stroke="url(#logo-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="flex flex-col justify-center">
            <span className="font-['Sora'] text-[15px] font-semibold tracking-tight text-white leading-none">
              EquiScore
            </span>
            <div className="mt-[3px]">
              <span className="microlabel bg-accent-400/15 text-accent-400 rounded-full px-1.5 py-[1px] inline-block !text-[8px] leading-tight">
                JUDGE COPILOT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center zone */}
      <div className="flex flex-col items-center justify-center flex-1 overflow-hidden pointer-events-none">
        <h1 className="font-['Sora'] text-[16px] font-semibold text-white truncate max-w-full leading-tight">
          Global Hackathon 2026: AI Infrastructure
        </h1>
        <p className="font-sans text-[12px] text-gray-400 mt-0.5 truncate">
          47 teams · 12 evaluated · 35 pending
        </p>
      </div>

      {/* Right zone */}
      <div className="flex items-center gap-4 w-[240px] justify-end flex-shrink-0">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full bg-teal-400"
            style={{ 
              boxShadow: '0 0 0 4px var(--teal-glow)', 
              animation: 'breathe 2s ease infinite'
            }}
          />
          <span className="microlabel text-teal-400">LIVE</span>
        </div>
        
        <div className="w-[1px] h-[20px] bg-[var(--border-subtle)]" />
        
        <span className="font-mono text-[14px] text-gray-400 select-none tabular-nums">
          {timeStr}
        </span>
        
        <div className="w-[1px] h-[20px] bg-[var(--border-subtle)]" />
        
        <button 
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-800 transition-colors cursor-pointer group"
          data-magnetic="true"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          <Command size={16} className="text-gray-400 group-hover:text-white transition-colors" />
        </button>

        <div className="w-8 h-8 rounded-full shadow-md flex items-center justify-center border border-white/10"
             style={{ background: 'linear-gradient(135deg, var(--accent-400), var(--teal-400))' }}>
          <span className="font-sans text-[12px] font-bold text-white">DK</span>
        </div>
      </div>
    </header>
  );
};
