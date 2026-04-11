import React from 'react';
import { UploadProgress } from '../components/ds/UploadProgress/UploadProgress';

export default {
  title: 'Components/UploadProgress',
  component: UploadProgress,
  parameters: { layout: 'centered' }
};

export const Default = () => (
  <div className="w-[400px] border border-[var(--border-default)] p-4 glass-1 rounded">
    <UploadProgress progress={65} speedLabel="4.2 MB/s" remainingLabel="~12s left" onCancel={() => {}} />
  </div>
);
