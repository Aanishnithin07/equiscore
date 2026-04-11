import React from 'react';
import { ProcessingTimeline } from '../components/ds/ProcessingTimeline/ProcessingTimeline';

export default {
  title: 'Components/ProcessingTimeline',
  component: ProcessingTimeline,
  parameters: { layout: 'padded' }
};

const steps: any[] = [
  { id: '1', label: 'Uploaded', sublabel: 'pitch_deck.pdf stored securely', status: 'done' },
  { id: '2', label: 'Extracting content', sublabel: 'LLM parsing slides geometry', status: 'active' },
  { id: '3', label: 'AI Evaluating', sublabel: 'Checking 5 rubric categories', status: 'pending' },
  { id: '4', label: 'Complete', sublabel: 'Awaiting judge publication', status: 'pending' },
];

export const ActiveState = () => (
  <div className="w-[400px] glass-1 p-6 rounded-xl border border-[var(--border-default)] relative h-[500px]">
    <ProcessingTimeline steps={steps} estimatedSecondsLeft={12} />
  </div>
);
