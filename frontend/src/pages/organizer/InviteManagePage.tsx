import React, { useState } from 'react';
import { InviteCreator } from '../../components/organizer/InviteCreator/InviteCreator';
import { InvitesTable, InviteRecord } from '../../components/organizer/InvitesTable/InvitesTable';

/**
 * @page InviteManagePage
 * @description Admin command interface securely interacting with auth generation tokens cleanly.
 */
export const InviteManagePage: React.FC = () => {
    const [invites, setInvites] = useState<InviteRecord[]>([
        { id: '1', role: 'judge', trackName: 'Healthcare', code: 'xb729ka', status: 'pending', createdAt: 'Today, 14:00' },
        { id: '2', role: 'organizer', code: 'zz991ll', status: 'accepted', createdAt: 'Yesterday, 09:30' },
    ]);

    const handleGenerate = async (role: any, trackId?: string) => {
        return new Promise<string>((resolve) => {
            setTimeout(() => {
                const code = Math.random().toString(36).substring(7);
                setInvites(prev => [{
                    id: Math.random().toString(),
                    role,
                    trackName: trackId === 'health' ? 'Healthcare' : trackId === 'ai' ? 'AI/ML' : trackId === 'open' ? 'Open' : undefined,
                    code,
                    status: 'pending',
                    createdAt: 'Just now'
                }, ...prev]);
                resolve(`https://equiscore.app/join/${code}`);
            }, 800);
        });
    };

    const handleRevoke = (id: string) => {
        setInvites(prev => prev.map(i => i.id === id ? { ...i, status: 'revoked' } : i));
    };

    return (
        <div className="w-full max-w-[900px] p-8 flex flex-col gap-8 mx-auto">
            <header>
                <h1 className="heading-2 font-['Sora'] text-white">Access & Invites</h1>
                <p className="font-sans text-[14px] text-[var(--text-tertiary)]">Control judge panels and distribute organizer privileges natively.</p>
            </header>

            <InviteCreator onGenerate={handleGenerate} />
            <InvitesTable invites={invites} onRevoke={handleRevoke} />
        </div>
    );
};
