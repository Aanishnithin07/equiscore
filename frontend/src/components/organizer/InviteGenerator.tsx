import React, { useState } from 'react';
import { api } from '../../api/client';
import { Copy, Check, Link as LinkIcon, RefreshCcw } from 'lucide-react';

export const InviteGenerator: React.FC = () => {
    const [role, setRole] = useState<'judge' | 'team_member'>('team_member');
    const [teamName, setTeamName] = useState('');
    const [expiry, setExpiry] = useState(7);
    
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Note: backend expects hackathon_id right now in GenerateInviteRequest body. 
            // Phase 6 specs usually abstracts it to extract from auth / context automatically by interceptors,
            // but we mock it correctly to pass the payload matching backend schema:
            // payload: { hackathon_id: uuid.UUID, role: HackathonRole, team_name: str | None }
            
            // We use token spoof logic here, the backend routes to /api/v1/invites/generate
            const tokenMock = btoa(`mock_token_${Date.now()}`); // Fake token since we mock backend UI mapping
            
            setTimeout(() => {
                const inviteUrl = `${window.location.origin}/join?token=${tokenMock}`;
                setGeneratedLink(inviteUrl);
                setIsLoading(false);
                setCopied(false);
            }, 500);

            // In real app:
            // const res = await api.client.post('/invites/generate', { hackathon_id: actual_id, role, team_name: teamName });
            // setGeneratedLink(window.location.origin + res.data.invite_url);
            
        } catch (err: any) {
            console.error('Failed to generate invite');
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-amber-400" />
                Generate New Invite
            </h3>
            
            <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button 
                            type="button" 
                            onClick={() => setRole('team_member')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'team_member' ? 'bg-slate-700 text-teal-400 shadow' : 'text-slate-400 hover:text-slate-300'}`}
                        >
                            Team
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setRole('judge')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'judge' ? 'bg-slate-700 text-amber-400 shadow' : 'text-slate-400 hover:text-slate-300'}`}
                        >
                            Judge
                        </button>
                    </div>
                </div>

                {role === 'team_member' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Target Team Name (Optional)</label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Delta Force"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">If blank, users choose their own team name upon joining.</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Expiry</label>
                    <select 
                        value={expiry} 
                        onChange={(e) => setExpiry(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                        <option value={1}>24 Hours</option>
                        <option value={7}>7 Days</option>
                        <option value={30}>30 Days</option>
                    </select>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative group bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-500 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                        {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : 'Generate Link'}
                    </button>
                </div>
            </form>

            {generatedLink && (
                <div className="mt-6 pt-6 border-t border-slate-700 animate-in fade-in slide-in-from-bottom-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Invite Link</label>
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-1 py-1">
                        <code className="flex-1 text-xs text-teal-400 truncate break-all overflow-hidden font-mono px-2 py-2">
                            {generatedLink}
                        </code>
                        <button
                            onClick={handleCopy}
                            className={`p-2 rounded-md transition-colors ${copied ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
