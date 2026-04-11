import React from 'react';
import { ReportDownloadCard } from '../components/ds/ReportDownloadCard/ReportDownloadCard';

export default {
  title: 'Components/ReportDownloadCard',
  component: ReportDownloadCard,
  parameters: { layout: 'padded' }
};

export const Default = () => (
  <div className="w-[800px] max-w-full mx-auto">
    <ReportDownloadCard onDownload={() => alert('Downloading PDF...')} />
  </div>
);
