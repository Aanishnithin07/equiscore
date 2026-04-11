import React from 'react';
import { RubricHeatmap, HeatmapCell } from '../components/organizer/RubricHeatmap/RubricHeatmap';

export default {
  title: 'Organizer / Analytics / RubricHeatmap',
  component: RubricHeatmap,
  parameters: { layout: 'padded' }
};

const categories = ['Innovation & Novelty', 'Technical Complexity', 'Business Viability', 'Design & UX', 'Feasibility'];
const data: HeatmapCell[] = [];

categories.forEach(cat => {
    (['health', 'ai', 'open'] as const).forEach(trackId => {
        data.push({
            trackId,
            category: cat,
            avgScore: Math.random() * 40 + 40, // 40 to 80
            teamCount: Math.floor(Math.random() * 50) + 10
        });
    });
});

export const Demo = () => (
    <div className="w-[800px] max-w-full mx-auto">
        <RubricHeatmap data={data} categories={categories} />
    </div>
);
