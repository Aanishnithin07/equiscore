// frontend/src/components/organizer/VirtualTeamTable/VirtualTeamTable.tsx
import React, { useRef, useState, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, FileText, CheckCircle, XCircle, Search, CustomProgressRing } from 'lucide-react'; // Mocking some icons
import { ScoreRing } from '../../ds/ScoreRing/ScoreRing';
import { Badge } from '../../ds/Badge/Badge';
import { Button } from '../../ds/Button/Button';
import { spring } from '../../../lib/motion-config';

export interface TableTeamData {
  id: string;
  rank: number | null;
  name: string;
  track: { id: string; name: string; color: string };
  score: number | null;
  behavioral: number | null;
  status: 'unscored' | 'processing' | 'evaluated' | 'rejected' | 'advanced';
  topStrengths: string[];
  topWeakness: string;
}

interface Props {
  data: TableTeamData[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: (selectAll: boolean) => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  width: number;
  height: number;
}

/**
 * @component VirtualTeamTable
 * @description Master data view embedding DOM virtualization mapping Framer layout animations gracefully 
 * injecting 500+ nodes seamlessly without browser overhead.
 */
export const VirtualTeamTable: React.FC<Props> = ({ data, selectedIds, onToggleSelect, onToggleAll, expandedId, onToggleExpand, width, height }) => {
  const listRef = useRef<List>(null);
  
  // Whenever expandedId changes, recalculate react-window bounds
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [expandedId]);

  const getItemSize = (index: number) => {
    const item = data[index];
    return item.id === expandedId ? 220 : 72;
  };

  const getStatusBadge = (s: TableTeamData['status']) => {
    switch (s) {
      case 'evaluated': return <Badge variant="success">Evaluated</Badge>;
      case 'advanced': return <Badge variant="accent">Advanced</Badge>;
      case 'rejected': return <Badge variant="error">Rejected</Badge>;
      case 'processing': return <Badge variant="warning">Processing...</Badge>;
      default: return <Badge variant="neutral">Unscored</Badge>;
    }
  };

  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const team = data[index];
    const isExpanded = team.id === expandedId;
    const isSelected = selectedIds.has(team.id);

    return (
      <motion.div
        animate={{ top: style.top, height: style.height }}
        initial={{ top: style.top, height: style.height }}
        transition={spring.bouncy as any}
        className="absolute w-full px-4"
        style={{ width: style.width }}
      >
        <div 
          className={`
            w-full h-full flex flex-col overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border-subtle)] transition-colors relative group
            ${index % 2 === 0 ? 'bg-[var(--bg-elevated)]/30' : 'bg-[var(--bg-surface)]'}
            ${isSelected ? 'border-[var(--accent-400)]/50 bg-[var(--accent-400)]/5 !border-[0.5px]' : 'hover:bg-[var(--bg-overlay)]'}
            ${isExpanded ? 'glass-3 border-[var(--border-strong)] z-10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]' : ''}
          `}
          onClick={() => onToggleExpand(team.id)}
        >
          {/* Main 72px Row Data */}
          <div className="h-[72px] flex items-center shrink-0 px-2 cursor-pointer relative z-10 w-full hover:bg-[var(--bg-void)]/20 transition-colors">
            
            {/* Conditional Checkbox Column spanning exact layout offsets */}
            <div className={`shrink-0 flex items-center justify-center transition-all duration-300 overflow-hidden ${selectedIds.size > 0 ? 'w-10 opacity-100 mr-2' : 'w-0 opacity-0 group-hover:w-10 group-hover:opacity-100 group-hover:mr-2'}`} onClick={e => e.stopPropagation()}>
              <input 
                type="checkbox" checked={isSelected} onChange={() => onToggleSelect(team.id)}
                className="w-4 h-4 rounded-[4px] bg-[var(--bg-void)] border border-[var(--border-strong)] checked:bg-[var(--accent-400)] checked:border-[var(--accent-400)] appearance-none relative  before:content-[''] checked:before:block before:hidden before:w-[4px] before:h-[8px] before:border-r-2 before:border-b-2 before:border-white before:absolute before:left-1.5 before:top-[1px] before:rotate-45"
              />
            </div>

            <div className="w-[40px] shrink-0 flex items-center justify-center">
              {team.rank ? <span className="font-mono text-[14px] text-[var(--accent-400)] font-bold">#{team.rank}</span> : <div className="w-2 h-2 rounded-full bg-[var(--border-strong)]" />}
            </div>

            <div className="flex-1 min-w-0 pr-4 flex flex-col justify-center">
              <span className="font-sans font-bold text-[14px] text-white truncate w-full">{team.name}</span>
              <div className="mt-1 flex items-center">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-[1px] rounded bg-[var(--bg-void)] border border-[var(--border-subtle)]`} style={{ color: team.track.color }}>
                  {team.track.name}
                </span>
              </div>
            </div>

            <div className="w-[80px] shrink-0 flex flex-col items-center justify-center">
              {team.score ? (
                <>
                  <span className="font-mono text-[16px] font-bold text-white shrink-0 leading-none">{team.score.toFixed(1)}</span>
                  <div className="w-[32px] h-[4px] rounded-full bg-[var(--border-subtle)] mt-1.5 overflow-hidden">
                    <div className="h-full bg-[var(--accent-400)]" style={{ width: `${team.score}%` }} />
                  </div>
                </>
              ) : team.status === 'processing' ? (
                <div className="w-4 h-4 border-[2px] border-[var(--border-strong)] border-t-[var(--accent-400)] rounded-full animate-spin" />
              ) : (
                <span className="text-[var(--text-tertiary)]">—</span>
              )}
            </div>

            <div className="w-[80px] shrink-0 flex justify-center">
              {team.behavioral ? <ScoreRing score={team.behavioral} size="xs" hideLabel /> : <span className="text-[var(--text-tertiary)]">—</span>}
            </div>

            <div className="w-[120px] shrink-0 flex justify-center">
              {getStatusBadge(team.status)}
            </div>

            <div className="w-[160px] shrink-0 flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button aria-label="View Details" title="View details" className="w-[32px] h-[32px] rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--bg-elevated)] transition-colors"><Eye size={16} /></button>
              <button aria-label="Generate PDF" title="Generate report" className="w-[32px] h-[32px] rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--accent-400)] hover:bg-[var(--accent-400)]/10 transition-colors"><FileText size={16} /></button>
              <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-1" />
              <button aria-label="Advance Match" title="Advance team" className="w-[32px] h-[32px] rounded-md flex items-center justify-center text-[var(--border-strong)] hover:text-teal-400 transition-colors"><CheckCircle size={16} /></button>
              <button aria-label="Reject Match" title="Reject team" className="w-[32px] h-[32px] rounded-md flex items-center justify-center text-[var(--border-strong)] hover:text-coral-400 transition-colors"><XCircle size={16} /></button>
            </div>
          </div>

          {/* Expanded 220px Detail Stage resolving Framer presence heights strictly */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={spring.snappy as any}
                className="w-full flex-1 border-t border-[var(--border-subtle)] bg-[var(--bg-void)]/60 flex items-center p-6 gap-8 overflow-hidden" 
                onClick={e => e.stopPropagation()} // Prevent toggling when interacting inside
              >
                <div className="shrink-0 w-[80px] h-[80px]">
                  <ScoreRing score={team.score || 0} size="sm" />
                </div>
                
                <div className="flex-1 flex gap-6 h-full border-l border-[var(--border-ghost)] pl-8">
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="font-sans text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> TOP STRENGTHS</span>
                    <ul className="flex flex-col gap-1.5">
                      {team.topStrengths.map((s, i) => <li key={i} className="font-sans text-[13px] text-white truncate max-w-[280px]">{s}</li>)}
                    </ul>
                  </div>

                  <div className="w-[1px] h-full bg-[var(--border-ghost)]" />

                  <div className="flex-1 flex flex-col justify-center">
                    <span className="font-sans text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-coral-400" /> CRITICAL WEAKNESS</span>
                    <p className="font-sans text-[13px] text-white overflow-hidden line-clamp-3 leading-snug">{team.topWeakness}</p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2 w-[160px]">
                    <Button variant="primary" className="w-full h-8 flex items-center justify-center gap-2 text-[12px]"><Eye size={12}/> View Deep Dive</Button>
                    <Button variant="ghost" className="w-full h-8 flex items-center justify-center gap-2 text-[12px] text-coral-400 hover:bg-coral-400/10"><XCircle size={12}/> Reject Match</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full relative rounded-b-[var(--radius-xl)] bg-[var(--bg-void)] overflow-hidden" style={{ width, height }}>
      <List
        ref={listRef}
        width={width}
        height={height}
        itemCount={data.length}
        itemSize={getItemSize}
        overscanCount={5}
        className="custom-scrollbar"
      >
        {Row}
      </List>
    </div>
  );
};
