import React, { useState } from 'react';
import { InviteManagePage } from '../pages/organizer/InviteManagePage';

export default {
  title: 'Pages/Organizer/InviteManagePage',
  component: InviteManagePage,
  parameters: { layout: 'fullscreen' }
};

export const Default = () => (
    <div className="w-full min-h-[100dvh] bg-[var(--bg-void)]">
        <InviteManagePage />
    </div>
);
