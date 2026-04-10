import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

export function TopBar() {
  const [time, setTime] = useState<string>('');
  const [isLive, setIsLive] = useState<boolean>(false);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // API connectivity ping
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.healthCheck();
        setIsLive(true);
      } catch {
        setIsLive(false);
      }
    };
    checkHealth(); // Initial check
    const healthTimer = setInterval(checkHealth, 10000); // Check every 10s
    return () => clearInterval(healthTimer);
  }, []);

  return (
    <header className="h-14 w-full flex-shrink-0 bg-background-surface border-b border-border-subtle flex items-center justify-between px-6 z-20">
      
      {/* Left: Branding */}
      <div className="flex items-center space-x-3">
        {/* Stylized Logo Block */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-primary/60 flex items-center justify-center font-display font-bold text-white shadow-[0_0_15px_rgba(124,111,247,0.3)]">
          E=
        </div>
        <h1 className="font-display font-semibold text-text-primary tracking-wide">
          EquiScore
        </h1>
      </div>

      {/* Center: Hackathon Name */}
      <div className="hidden md:flex font-body text-sm font-medium text-text-secondary">
        {import.meta.env.VITE_HACKATHON_NAME || 'ETHGlobal 2026 Hackathon'}
      </div>

      {/* Right: Clock & Status */}
      <div className="flex items-center space-x-6">
        <div className="font-mono text-sm tracking-wider text-text-primary/90 w-20 text-right">
          {time}
        </div>
        
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-background-elevated border border-border-subtle">
          <div className="relative flex h-2 w-2">
            {isLive ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-secondary"></span>
              </>
            ) : (
             <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-danger"></span>
            )}
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-text-secondary">
            {isLive ? 'LIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

    </header>
  );
}
