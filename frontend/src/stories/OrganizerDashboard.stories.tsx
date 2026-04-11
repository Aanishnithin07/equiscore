import React from 'react';
import { OrganizerDashboard } from '../pages/organizer/OrganizerDashboard';

export default {
  title: 'Pages/Organizer/OrganizerDashboard',
  component: OrganizerDashboard,
  parameters: { layout: 'fullscreen' }
};

export const Interactive = () => (
    <div className="w-full bg-[var(--bg-void)]">
        <OrganizerDashboard />
    </div>
);
