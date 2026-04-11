import React, { useState } from 'react';
import { TrackSelector } from '../components/ds/TrackSelector/TrackSelector';

export default {
  title: 'Components/TrackSelector',
  component: TrackSelector,
  parameters: { layout: 'centered' }
};

const tracks: any[] = [
  { id: '1', name: 'Healthcare', description: 'Biotech, telemedicine, and diagnostics.', type: 'health' },
  { id: '2', name: 'AI/ML', description: 'Core intelligence models and infra.', type: 'ai' },
  { id: '3', name: 'Open', description: 'All other generalized implementations.', type: 'open' },
];

export const Interactive = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="w-[600px]">
      <TrackSelector tracks={tracks} selectedId={selected} onSelect={setSelected} />
    </div>
  );
};
