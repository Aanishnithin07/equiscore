import React from 'react';
import { ScoreDistributionChart } from '../../components/organizer/ScoreDistributionChart/ScoreDistributionChart';
import { TrackViolinChart } from '../../components/organizer/TrackViolinChart/TrackViolinChart';
import { RubricHeatmap } from '../../components/organizer/RubricHeatmap/RubricHeatmap';
import { PlagiarismScatterPlot } from '../../components/organizer/PlagiarismScatterPlot/PlagiarismScatterPlot';
import { motion } from 'framer-motion';

// Pull the mocks directly to satisfy the page composition for now natively
const heatmapCategories = ['Innovation', 'Technical Complexity', 'Business Viability', 'Design & UX', 'Feasibility'];
const heatmapData = heatmapCategories.flatMap(c => ['health', 'ai', 'open'].map(t => ({ trackId: t as any, category: c, avgScore: Math.random() * 40 + 40, teamCount: 15 })));
const distData = Array.from({ length: 21 }).map((_, i) => ({ score: i * 5, count: Math.round(Math.exp(-Math.pow(i * 5 - 75, 2) / 450) * 100), percentile: i * 5 }));
const nodes = Array.from({ length: 40 }).map((_, i) => ({ id: `n${i}`, name: `Team ${i}`, x: Math.random(), y: Math.random(), trackId: 'ai' as any }));

/**
 * @page AnalyticsPage
 * @description Master data-art composing grid framing 4 extreme visualization matrices symmetrically.
 */
export const AnalyticsPage: React.FC = () => {
    return (
        <div className="w-full min-h-[100dvh] flex flex-col p-8 gap-8 overflow-y-auto custom-scrollbar">
            
            <header className="mb-4">
                <h1 className="heading-2 font-['Sora'] text-white">Advanced Analytics</h1>
                <p className="font-sans text-[14px] text-[var(--text-tertiary)]">Global intelligence mapped linearly crossing track heuristics securely.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <ScoreDistributionChart data={distData} mean={73} median={76} />
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <TrackViolinChart tracks={[{ id: 'h', name: 'Health', type: 'health', metrics: {min: 0, max: 100, median: 80}, distribution: distData }]} />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full mb-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <RubricHeatmap data={heatmapData} categories={heatmapCategories} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <PlagiarismScatterPlot nodes={nodes} links={[]} />
                </motion.div>
            </div>

        </div>
    );
};
