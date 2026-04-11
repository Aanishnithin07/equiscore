// frontend/src/components/organizer/InvitesTable/InvitesTable.tsx
import React from 'react';
import { Badge } from '../../ds/Badge/Badge';
import { Trash2 } from 'lucide-react';

export interface InviteRecord {
  id: string;
  role: 'judge' | 'organizer';
  trackName?: string;
  code: string;
  status: 'pending' | 'accepted' | 'revoked';
  createdAt: string;
}

interface Props {
  invites: InviteRecord[];
  onRevoke: (id: string) => void;
}

/**
 * @component InvitesTable
 * @description Standardized data display safely interpreting semantic token objects natively.
 */
export const InvitesTable: React.FC<Props> = ({ invites, onRevoke }) => {
  return (
    <div className="w-full glass-2 rounded-xl border border-[var(--border-default)] flex flex-col">
      <div className="h-[48px] border-b border-[var(--border-subtle)] flex items-center px-6">
        <div className="flex-1 font-sans font-bold text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest">INVITE CODE</div>
        <div className="w-[180px] font-sans font-bold text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest text-center">ROLE</div>
        <div className="w-[120px] font-sans font-bold text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest text-center">STATUS</div>
        <div className="w-[140px] font-sans font-bold text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest text-center">CREATED</div>
        <div className="w-[80px] font-sans font-bold text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest text-right">ACTIONS</div>
      </div>

      <div className="flex flex-col">
        {invites.map((inv, idx) => (
            <div key={inv.id} className={`h-[60px] flex items-center px-6 transition-colors hover:bg-[var(--bg-overlay)] border-[0.5px] border-transparent border-b-[var(--border-ghost)] last:border-b-transparent ${idx % 2 === 0 ? '' : 'bg-[var(--bg-overlay)]/30'}`}>
                <div className="flex-1 font-mono text-[13px] text-white flex items-center gap-2 min-w-0">
                    <span className="truncate">eqs_{inv.code}</span>
                </div>

                <div className="w-[180px] flex flex-col items-center justify-center">
                    <span className="font-sans font-bold text-[12px] text-white capitalize">{inv.role}</span>
                    {inv.trackName && <span className="font-sans text-[10px] text-[var(--teal-400)]">{inv.trackName} track</span>}
                </div>

                <div className="w-[120px] flex items-center justify-center">
                    {inv.status === 'accepted' ? <Badge variant="success">Accepted</Badge> : inv.status === 'revoked' ? <Badge variant="danger" className="opacity-50">Revoked</Badge> : <Badge variant="warning">Pending</Badge>}
                </div>

                <div className="w-[140px] flex items-center justify-center font-sans text-[12px] text-[var(--text-secondary)]">
                    {inv.createdAt}
                </div>

                <div className="w-[80px] flex items-center justify-end">
                    <button 
                        onClick={() => onRevoke(inv.id)}
                        disabled={inv.status !== 'pending'}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-coral-400 hover:bg-coral-400/10 transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[var(--text-tertiary)]"
                        title="Revoke Invite"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        ))}

        {invites.length === 0 && (
            <div className="h-[120px] flex items-center justify-center font-sans text-[13px] text-[var(--text-tertiary)]">
                No active invitations generated yet.
            </div>
        )}
      </div>
    </div>
  );
};
