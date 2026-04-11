import React, { useState } from 'react';
import { CommandHeader, HackathonStage } from '../../components/organizer/CommandHeader/CommandHeader';
import { StatCommandRow } from '../../components/organizer/StatCommandRow/StatCommandRow';
import { LiveActivityFeed } from '../../components/organizer/LiveActivityFeed/LiveActivityFeed';
import { Users, FileText, Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * @page OrganizerDashboard
 * @description The ultimate command war room embedding global statistics cleanly into dynamic layout trees.
 */
export const OrganizerDashboard: React.FC = () => {
    const [stage, setStage] = useState<HackathonStage>('evaluating');

    const stats = [
        { id: '1', label: 'TOTAL SUBMISSIONS', value: 142, trendDir: 'up', trendText: '12 since last hour', accent: 'accent', icon: Users },
        { id: '2', label: 'ANALYZED', value: 108, trendDir: 'up', trendText: '9 in last 10m', accent: 'teal', icon: FileText },
        { id: '3', label: 'AVG SCORE', value: '78.4', trendDir: 'none', trendText: 'Stable distribution', accent: 'amber', icon: Activity },
        { id: '4', label: 'SIMILARITY FLAGS', value: 3, trendDir: 'up', trendText: '2 new high-risk pairs', accent: 'coral', icon: AlertTriangle },
    ] as any;

    const events = [
        { id: '1', timestamp: '14:02:11', desc: 'Deck uploaded (18MB)', team: 'NeuralNet Ninjas', type: 'submission' },
        { id: '2', timestamp: '14:03:00', desc: 'Score finalized: 84.5', team: 'Data Divas', type: 'evaluation_complete' },
        { id: '3', timestamp: '14:06:12', desc: 'Structural collision >88%', team: 'HackMasters', type: 'flag_detected' },
    ] as any;

    return (
        <div className="w-full min-h-[100dvh] flex flex-col overflow-y-auto custom-scrollbar relative">
            
            {/* The sticky master command layer */}
            <div className="sticky top-0 z-40">
                <CommandHeader hackathonName="OpenSauce 2025" currentStage={stage} onAdvanceStage={setStage} />
            </div>

            <div className="p-8 flex flex-col gap-8 flex-1 w-full max-w-[1400px] mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <StatCommandRow stats={stats} />
                </motion.div>

                <div className="flex gap-8 h-[500px]">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-[2] glass-2 rounded-xl border border-[var(--border-default)] p-6">
                        <span className="microlabel text-[var(--text-tertiary)] block mb-4">SYSTEM TOPOLOGY (COMING SOON)</span>
                        <div className="w-full h-full flex items-center justify-center font-mono opacity-20 text-[14px]">
                            [ 3D FORCE GRAPH STUB ]
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex-[1] min-w-[340px]">
                        <LiveActivityFeed events={events} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
