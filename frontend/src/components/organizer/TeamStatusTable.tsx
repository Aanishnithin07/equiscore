import React from 'react';
import { TeamMemberRow } from '../../hooks/useOrganizerData';

export const TeamStatusTable: React.FC<{ teams: TeamMemberRow[] }> = ({ teams }) => {

    const trackColors: Record<string, string> = {
        'healthcare': 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        'ai_ml': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
        'open_innovation': 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    };

    const statusColors: Record<string, string> = {
        'completed': 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
        'processing': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        'failed': 'bg-coral-500/10 text-coral-400 border border-coral-500/20',
        'pending': 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                        <th className="py-4 px-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Team</th>
                        <th className="py-4 px-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Track</th>
                        <th className="py-4 px-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-6 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Overall Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {teams.map((team, idx) => (
                        <tr key={team.id} className="hover:bg-slate-800/80 transition-colors">
                           <td className="py-4 px-6 whitespace-nowrap">
                              <div className="flex items-center">
                                 <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white mr-3">
                                     {idx + 1}
                                 </div>
                                 <span className="font-medium text-slate-200">{team.name}</span>
                              </div>
                           </td>
                           <td className="py-4 px-6 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${trackColors[team.track]}`}>
                                 {team.track.replace('_', '/').toUpperCase()}
                              </span>
                           </td>
                           <td className="py-4 px-6 whitespace-nowrap">
                               <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[team.status]}`}>
                                 {team.status.toUpperCase()}
                              </span>
                           </td>
                           <td className="py-4 px-6 whitespace-nowrap text-right">
                               {team.score ? (
                                   <span className={`font-mono font-bold ${team.score >= 80 ? 'text-teal-400' : team.score >= 60 ? 'text-amber-400' : 'text-coral-400'}`}>
                                       {team.score}
                                   </span>
                               ) : (
                                   <span className="text-slate-600 font-mono">—</span>
                               )}
                           </td>
                        </tr>
                    ))}
                    {teams.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                                No teams have registered or submitted yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
