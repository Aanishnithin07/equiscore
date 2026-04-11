import React from 'react';
import { CommandHeader } from '../components/organizer/CommandHeader/CommandHeader';

export default {
  title: 'Organizer / CommandHeader',
  component: CommandHeader,
  parameters: { layout: 'fullscreen' }
};

export const Live = () => (
    <div className="w-full h-[500px] bg-[var(--bg-void)] relative p-0">
        <CommandHeader hackathonName="OpenSauce 2025" currentStage="evaluating" onAdvanceStage={() => {}} />
    </div>
);
