import React, { useState, useEffect } from 'react';
import { LiveActivityFeed, FeedEvent } from '../components/organizer/LiveActivityFeed/LiveActivityFeed';

export default {
  title: 'Organizer / LiveActivityFeed',
  component: LiveActivityFeed,
  parameters: { layout: 'padded' }
};

export const LiveDemo = () => {
  const [events, setEvents] = useState<FeedEvent[]>([
    { id: '1', timestamp: '14:02:11', desc: 'Deck uploaded (18MB)', team: 'NeuralNet Ninjas', type: 'submission' },
    { id: '2', timestamp: '14:03:00', desc: 'Score finalized: 84.5', team: 'Data Divas', type: 'evaluation_complete' },
  ]);

  useEffect(() => {
    const t = setInterval(() => {
        setEvents(prev => {
            const types: any[] = ['submission', 'evaluation_complete', 'flag_detected', 'judge_override'];
            const newEvent = {
                id: Math.random().toString(),
                timestamp: new Date().toLocaleTimeString(),
                desc: 'Random network activity detected natively.',
                team: 'Team ' + Math.floor(Math.random() * 1000),
                type: types[Math.floor(Math.random() * types.length)]
            };
            const next = [...prev, newEvent];
            if (next.length > 50) next.shift(); // keep last 50
            return next;
        });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-[300px] h-[500px]">
        <LiveActivityFeed events={events} />
    </div>
  );
}
