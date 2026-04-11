import React from 'react';
import { TeamsManagePage } from '../pages/organizer/TeamsManagePage';

export default {
  title: 'Pages/Organizer/TeamsManagePage',
  component: TeamsManagePage,
  parameters: { layout: 'fullscreen' }
};

export const Live = () => (
    <div className="w-full h-[100dvh] bg-[var(--bg-void)]">
        <TeamsManagePage />
    </div>
);
