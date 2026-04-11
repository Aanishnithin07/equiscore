import React, { useState } from 'react';
import { OrganizerSidebar } from '../components/organizer/OrganizerSidebar/OrganizerSidebar';

export default {
  title: 'Organizer / OrganizerSidebar',
  component: OrganizerSidebar,
  parameters: { layout: 'fullscreen' }
};

export const Interactive = () => {
    const [active, setActive] = useState('dashboard');
    return (
        <div className="flex h-[100dvh] bg-[var(--bg-void)]">
            <OrganizerSidebar activeId={active} onNavigate={setActive} />
            <div className="flex-1 p-8 text-white font-mono opacity-50 border-l border-[var(--border-default)]">MAIN CONTENT AREA</div>
        </div>
    );
};
