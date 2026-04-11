import React from 'react';
import { StatCommandRow, StatSpec } from '../components/organizer/StatCommandRow/StatCommandRow';
import { Users, FileText, Activity, AlertTriangle } from 'lucide-react';

export default {
  title: 'Organizer / StatCommandRow',
  component: StatCommandRow,
  parameters: { layout: 'padded' }
};

const stats: StatSpec[] = [
    { id: '1', label: 'TOTAL SUBMISSIONS', value: 142, trendDir: 'up', trendText: '12 since last hour', accent: 'accent', icon: Users },
    { id: '2', label: 'ANALYZED', value: 108, trendDir: 'up', trendText: '9 in last 10m', accent: 'teal', icon: FileText },
    { id: '3', label: 'AVG SCORE', value: '78.4', trendDir: 'none', trendText: 'Stable distribution', accent: 'amber', icon: Activity },
    { id: '4', label: 'SIMILARITY FLAGS', value: 3, trendDir: 'up', trendText: '2 new high-risk pairs', accent: 'coral', icon: AlertTriangle },
];

export const Default = () => (
    <div className="w-[1000px] max-w-full">
        <StatCommandRow stats={stats} />
    </div>
);
