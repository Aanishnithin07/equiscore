import React from 'react';
import { ScoreDistributionChart } from '../../components/organizer/ScoreDistributionChart/ScoreDistributionChart';
import { TrackViolinChart } from '../../components/organizer/TrackViolinChart/TrackViolinChart';
import { RubricHeatmap } from '../../components/organizer/RubricHeatmap/RubricHeatmap';
import { PlagiarismScatterPlot } from '../../components/organizer/PlagiarismScatterPlot/PlagiarismScatterPlot';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Loader2 } from 'lucide-react';

/**
 * @page AnalyticsPage
 * @description Master data-art composing grid framing 4 extreme visualization matrices symmetrically.
 */
export const AnalyticsPage: React.FC = () => {
    const { data: analytics, isLoading } = useQuery({
       queryKey: ['global-analytics'],
       queryFn: async () => {
           const res = await apiClient.get('/analytics/overview');
           return res.data;
       }
    });

    if (isLoading) {
        return (
            <div className="w-full min-h-[100dvh] flex items-center justify-center">
                <Loader2 className="animate-spin text-[var(--accent-400)]" size={48} />
            </div>
        );
    }

    const { 
        distData = [], 
        heatmapData = [], 
        heatmapCategories = [], 
        nodes = [],
        mean = 0,
        median = 0 
    } = analytics || {};

    return (
        <div className="w-full min-h-[100dvh] flex flex-col p-8 gap-8 overflow-y-auto custom-scrollbar">
            
            <header className="mb-4">
                <h1 className="heading-2 font-['Sora'] text-white">Advanced Analytics</h1>
                <p className="font-sans text-[14px] text-[var(--text-tertiary)]">Global intelligence mapped linearly crossing track heuristics securely.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <ScoreDistributionChart data={distData} mean={mean} median={median} />
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <TrackViolinChart tracks={[{ id: 'h', name: 'Health', type: 'health', metrics: {min: 0, max: 100, median: 80}, distribution: distData.map((d: any) => ({ score: d.score, value: d.count })) }]} />
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
