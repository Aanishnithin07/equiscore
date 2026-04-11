import React from 'react';
import { PlagiarismScatterPlot, SimNode, SimLink } from '../components/organizer/PlagiarismScatterPlot/PlagiarismScatterPlot';

export default {
  title: 'Organizer / Analytics / PlagiarismScatterPlot',
  component: PlagiarismScatterPlot,
  parameters: { layout: 'padded' }
};

const nodes: SimNode[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `node-${i}`,
    name: `Team ${i}`,
    x: 0.1 + Math.random() * 0.8,
    y: 0.1 + Math.random() * 0.8,
    trackId: ['health', 'ai', 'open'][Math.floor(Math.random() * 3)] as any
}));

// Force some nodes close and add links
nodes[0].x = 0.5; nodes[0].y = 0.5;
nodes[1].x = 0.52; nodes[1].y = 0.51;
nodes[2].x = 0.49; nodes[2].y = 0.48;

const links: SimLink[] = [
    { source: 'node-0', target: 'node-1', similarity: 0.92 },
    { source: 'node-0', target: 'node-2', similarity: 0.76 },
    { source: 'node-10', target: 'node-20', similarity: 0.88 },
];

export const Demo = () => (
    <div className="w-[800px] mx-auto p-8">
        <PlagiarismScatterPlot nodes={nodes} links={links} />
    </div>
);
