import React, { useState } from 'react';
import { FloatingBulkActionBar } from './FloatingBulkActionBar';
import { Button } from '../../ds/Button/Button';

export default {
  title: 'Organizer / FloatingBulkActionBar',
  component: FloatingBulkActionBar,
  parameters: { layout: 'fullscreen' }
};

export const Interactive = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="w-full h-[100dvh] bg-[var(--bg-void)] relative p-8">
            <h1 className="text-white mb-4">Click below to augment selected count state:</h1>
            <div className="flex gap-4">
                <Button variant="primary" onClick={() => setCount(1)}>Select 1</Button>
                <Button variant="primary" onClick={() => setCount(12)}>Select 12</Button>
                <Button variant="ghost" onClick={() => setCount(0)}>Clear</Button>
            </div>
            
            <FloatingBulkActionBar 
                selectedCount={count} 
                onClear={() => setCount(0)} 
                onGenerateReports={() => alert('gen')} 
                onExport={() => alert('export')} 
            />
        </div>
    );
}
