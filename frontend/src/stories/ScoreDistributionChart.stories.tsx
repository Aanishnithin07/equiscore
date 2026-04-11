import React from 'react';
import { ScoreDistributionChart, ScoreBucket } from '../components/organizer/ScoreDistributionChart/ScoreDistributionChart';

export default {
  title: 'Organizer / Analytics / ScoreDistributionChart',
  component: ScoreDistributionChart,
  parameters: { layout: 'padded' }
};

// Generate normal distribution mock
const mockData: ScoreBucket[] = [];
for (let i = 0; i <= 100; i += 5) {
    const mean = 75;
    const std = 15;
    const exp = Math.exp(-Math.pow(i - mean, 2) / (2 * Math.pow(std, 2)));
    const count = Math.round((exp / (std * Math.sqrt(2 * Math.PI))) * 2000);
    mockData.push({ score: i, count, percentile: i });
}

export const Demo = () => (
    <div className="w-full max-w-[900px] mx-auto mt-12 bg-void p-8">
        <ScoreDistributionChart data={mockData} mean={73.2} median={76.0} />
    </div>
);
