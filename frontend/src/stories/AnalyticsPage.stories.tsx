import React from 'react';
import { AnalyticsPage } from '../pages/organizer/AnalyticsPage';

export default {
  title: 'Pages/Organizer/AnalyticsPage',
  component: AnalyticsPage,
  parameters: { layout: 'fullscreen' }
};

export const Default = () => (
    <div className="w-full bg-[var(--bg-void)]">
        <AnalyticsPage />
    </div>
);
