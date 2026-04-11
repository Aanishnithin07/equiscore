import React, { useState } from 'react';
import { VirtualTeamTable, TableTeamData } from '../components/organizer/VirtualTeamTable/VirtualTeamTable';

export default {
  title: 'Organizer / VirtualTeamTable',
  component: VirtualTeamTable,
  parameters: { layout: 'padded' }
};

const mockData: TableTeamData[] = Array.from({ length: 500 }).map((_, i) => ({
  id: `team-${i}`,
  rank: i < 50 ? i + 1 : null,
  name: `Team Alpha ${i}`,
  track: { id: 'health', name: 'Healthcare', color: 'var(--teal-400)' },
  score: i < 300 ? 98.4 - (i * 0.1) : null,
  behavioral: i < 300 ? 82.1 : null,
  status: i < 10 ? 'advanced' : i < 300 ? 'evaluated' : i < 320 ? 'processing' : 'unscored',
  topStrengths: ['Pacing optimization structure flawlessly mapped', 'Algorithm execution handles latency strictly'],
  topWeakness: 'Incomplete mapping around edge case zero thresholds inside logic arrays.',
}));

export const Interactive = () => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [expanded, setExpanded] = useState<string | null>(null);

    const toggleSelect = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto border border-[var(--border-subtle)] rounded-xl mt-8">
            <div className="h-[44px] bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] rounded-t-xl px-4 flex items-center z-20 relative text-[var(--text-secondary)] font-sans text-[12px] font-bold">
                TABLE HEADER MOCK
            </div>
            <VirtualTeamTable
                data={mockData}
                selectedIds={selected}
                onToggleSelect={toggleSelect}
                onToggleAll={() => {}}
                expandedId={expanded}
                onToggleExpand={(id) => setExpanded(prev => prev === id ? null : id)}
                width={1200}
                height={600}
            />
        </div>
    );
};
