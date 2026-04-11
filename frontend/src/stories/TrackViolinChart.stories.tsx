import React from 'react';
import { TrackViolinChart, ViolinData } from '../components/organizer/TrackViolinChart/TrackViolinChart';

export default {
  title: 'Organizer / Analytics / TrackViolinChart',
  component: TrackViolinChart,
  parameters: { layout: 'padded' }
};

const genDist = (mean: number, std: number) => {
    return Array.from({ length: 21 }).map((_, i) => ({
        score: i * 5,
        value: Math.exp(-Math.pow(i * 5 - mean, 2) / (2 * Math.pow(std, 2))) * 100
    }));
};

const mockData: ViolinData[] = [
    { id: '1', name: 'Healthcare', type: 'health', metrics: { min: 42, max: 96, median: 78 }, distribution: genDist(78, 12) },
    { id: '2', name: 'AI/ML', type: 'ai', metrics: { min: 38, max: 99, median: 84 }, distribution: genDist(84, 15) },
    { id: '3', name: 'Open', type: 'open', metrics: { min: 20, max: 91, median: 65 }, distribution: genDist(65, 20) },
];

export const Demo = () => (
    <div className="w-full max-w-[1000px] mx-auto mt-12 bg-void p-8">
        <TrackViolinChart tracks={mockData} />
    </div>
);
