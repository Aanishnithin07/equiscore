// frontend/src/components/organizer/OrganizerSidebar/OrganizerSidebar.tsx
import React, { useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { LayoutDashboard, Users, BarChart3, MailPlus, Settings, ShieldAlert } from 'lucide-react';
import { spring } from '../../../lib/motion-config';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'invites', label: 'Invites', icon: MailPlus },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'audit', label: 'Audit Log', icon: ShieldAlert },
];

interface Props {
  activeId: string;
  onNavigate: (id: string) => void;
}

/**
 * @component OrganizerSidebar
 * @description Highly persistent strict 220px command sidebar tracking active framer variants safely bridging
 * generic active states structurally matching `design-tokens`.
 */
export const OrganizerSidebar: React.FC<Props> = ({ activeId, onNavigate }) => {
  return (
    <div className="w-[220px] shrink-0 h-[100dvh] glass-3 border-r border-[var(--border-default)] flex flex-col pb-6 bg-[var(--bg-void)]/90 backdrop-blur-2xl">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-subtle)] shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 drop-shadow-[0_0_10px_var(--accent-glow)]">
            <path d="M4 6H12M4 12H12M4 18H20M14 6H20M14 12H20" stroke="var(--accent-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-['Sora'] font-bold text-[14px] text-white ml-3 tracking-wide">EquiScore<span className="text-[var(--accent-400)]">.</span></span>
      </div>

      {/* Navigation Matrix */}
      <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        <LayoutGroup id="organizer-nav">
            {navItems.map(item => {
                const isActive = activeId === item.id;
                const Icon = item.icon;
                
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`
                            relative h-[44px] w-full flex items-center px-3 rounded-[var(--radius-md)] transition-colors text-left
                            ${isActive ? 'text-white font-medium' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'}
                        `}
                        role="tab"
                        aria-selected={isActive}
                    >
                        {/* Active Indicator Slide (Framer Layout Animation) */}
                        {isActive && (
                            <motion.div 
                                layoutId="activeNavBg"
                                transition={spring.snappy as any}
                                className="absolute inset-0 bg-accent-400/10 border border-accent-400/20 rounded-[var(--radius-md)] z-0"
                            />
                        )}

                        <div className="relative z-10 flex items-center gap-3">
                            <Icon size={18} className={isActive ? 'text-[var(--accent-400)]' : 'opacity-70'} />
                            <span className="font-sans text-[13px]">{item.label}</span>
                        </div>
                    </button>
                );
            })}
        </LayoutGroup>
      </div>

      {/* Organizer Context Footprint */}
      <div className="mt-auto px-4">
        <div className="glass-1 p-3 rounded-lg border border-[var(--border-subtle)] flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors">
            <div className="w-8 h-8 rounded shrink-0 bg-gradient-to-br from-amber-400 to-coral-400 flex items-center justify-center font-['Sora'] font-bold text-[12px] text-black shadow-lg">
                OS
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-sans font-bold text-[12px] text-white truncate">OpenSauce '25</span>
                <span className="font-sans text-[10px] text-[var(--text-tertiary)]">Admin Role</span>
            </div>
        </div>
      </div>
    </div>
  );
};
