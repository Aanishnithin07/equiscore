import React, { useState } from 'react';
import { Filter, Download, X, Search, Loader2 } from 'lucide-react';
import { VirtualTeamTable, TableTeamData } from '../../components/organizer/VirtualTeamTable/VirtualTeamTable';
import { FloatingBulkActionBar } from '../../components/organizer/FloatingBulkActionBar/FloatingBulkActionBar';
import { Button } from '../../components/ds/Button/Button';
import { useOrganizerData } from '../../hooks/useOrganizerData';

/**
 * @page TeamsManagePage
 * @description Composes Table + Filters mapping 500+ records organically parsing bulk overlays.
 */
export const TeamsManagePage: React.FC = () => {
  const { teams, isLoading } = useOrganizerData();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  
  // Basic filtering states
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['status:evaluated']);

  // Dimensions
  const [containerHeight, setContainerHeight] = useState(600); 
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
        setContainerHeight(containerRef.current.getBoundingClientRect().height - 72);
    }
  }, []);

  const toggleSelect = (id: string) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelected(next);
  };

  const handleToggleAll = (all: boolean) => {
      if (!all) setSelected(new Set());
      else setSelected(new Set(teams.map((t: any) => t.id)));
  };

  if (isLoading) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-void)]">
              <Loader2 className="animate-spin text-[var(--accent-400)]" size={48} />
          </div>
      );
  }

  return (
    <div className="w-full h-full flex flex-col p-8 pb-0">
      
      {/* FILTER TOOLBAR  - Sticky Glass 2 */}
      <div className="glass-2 rounded-[var(--radius-xl)] border border-[var(--border-default)] p-3 mb-6 flex flex-wrap items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.15)] sticky top-8 z-30">
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input 
                    type="text" 
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search teams..."
                    className="h-[40px] w-[240px] glass-1 pl-10 pr-4 rounded-full border border-[var(--border-subtle)] outline-none text-[13px] font-sans text-white focus:border-[var(--accent-400)] transition-colors"
                />
            </div>

            <div className="w-[1px] h-6 bg-[var(--border-ghost)] mx-1" />

            {/* Pill Filters */}
            <div className="flex items-center gap-2">
                <span className="microlabel text-[var(--text-tertiary)] mr-1">TRACK</span>
                <button className="h-[32px] px-3 rounded-full text-[12px] font-sans text-white bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-teal-400 transition-colors">Healthcare</button>
                <button className="h-[32px] px-3 rounded-full text-[12px] font-sans text-[var(--accent-400)] bg-[var(--accent-400)]/10 border border-[var(--accent-400)] shadow-[0_0_10px_var(--accent-glow)] transition-colors">AI/ML</button>
            </div>

            <div className="w-[1px] h-6 bg-[var(--border-ghost)] mx-1" />

            <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-[32px] text-[12px] gap-2 px-3 py-0"> <Filter size={14} /> Status: Evaluated </Button>
            </div>

            {activeFilters.length > 0 && (
                <div className="ml-2 flex items-center gap-2 px-2 py-1 bg-coral-400/10 border border-coral-400/20 rounded-full text-coral-400 text-[11px] font-bold tracking-wider">
                    {activeFilters.length} FILTERS <X size={12} className="cursor-pointer hover:text-white" onClick={() => setActiveFilters([])}/>
                </div>
            )}
        </div>

        <Button variant="ghost" className="h-[40px] text-[13px] font-medium gap-2"><Download size={16}/> Export CSV</Button>
      </div>

      {/* VIRTUAL DATA TABLE STAGE */}
      <div className="w-full flex-1 glass-2 border border-[var(--border-default)] rounded-[var(--radius-xl)] flex flex-col relative overflow-hidden" ref={containerRef}>
        
        {/* Table Header Row (Absolute inside flex layout to align with data offsets) */}
        <div className="h-[72px] w-full border-b border-[var(--border-subtle)] bg-[var(--bg-void)]/80 backdrop-blur-md flex items-center z-20 shrink-0 px-4">
            <div className="w-[40px] shrink-0 mr-2 flex justify-center">
                <input 
                    type="checkbox" 
                    onChange={e => handleToggleAll(e.target.checked)}
                    checked={selected.size === (teams?.length || 0) && (teams?.length || 0) > 0}
                    className="w-4 h-4 rounded-[4px] bg-[var(--bg-void)] border border-[var(--border-strong)] checked:bg-[var(--accent-400)] checked:border-[var(--accent-400)] appearance-none cursor-pointer relative before:content-[''] checked:before:block before:hidden before:w-[4px] before:h-[8px] before:border-r-2 before:border-b-2 before:border-white before:absolute before:left-1.5 before:top-[1px] before:rotate-45" 
                />
            </div>
            
            <div className="w-[40px] shrink-0 font-sans font-bold text-[11px] text-[var(--accent-400)] flex justify-center uppercase tracking-widest cursor-pointer hover:text-white border-b-2 border-[var(--accent-400)]">#</div>
            <div className="flex-1 min-w-0 pr-4 font-sans font-bold text-[11px] text-[var(--text-tertiary)] hover:text-white uppercase tracking-widest cursor-pointer transition-colors">TEAM PIPELINE</div>
            <div className="w-[80px] shrink-0 font-sans font-bold text-[11px] text-[var(--text-tertiary)] flex justify-center uppercase tracking-widest cursor-pointer hover:text-white transition-colors">SCORE</div>
            <div className="w-[80px] shrink-0 font-sans font-bold text-[11px] text-[var(--text-tertiary)] flex justify-center uppercase tracking-widest cursor-pointer hover:text-white transition-colors">BEHAVIOR</div>
            <div className="w-[120px] shrink-0 font-sans font-bold text-[11px] text-[var(--text-tertiary)] flex justify-center uppercase tracking-widest cursor-pointer hover:text-white transition-colors">STATUS</div>
            <div className="w-[160px] shrink-0 font-sans font-bold text-[11px] text-[var(--text-tertiary)] flex justify-end uppercase tracking-widest">ACTIONS</div>
        </div>

        <VirtualTeamTable
            data={teams as any}
            selectedIds={selected}
            onToggleSelect={toggleSelect}
            onToggleAll={handleToggleAll}
            expandedId={expanded}
            onToggleExpand={(id) => setExpanded(prev => prev === id ? null : id)}
            width={containerRef.current?.clientWidth || 1000}
            height={containerHeight} // Flexed remainder
        />
      </div>

      <FloatingBulkActionBar 
        selectedCount={selected.size} 
        onClear={() => setSelected(new Set())}
        onGenerateReports={() => {}}
        onExport={() => {}}
      />
    </div>
  );
};
