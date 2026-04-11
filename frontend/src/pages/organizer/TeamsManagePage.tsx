import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useOrganizerData } from '../../hooks/useOrganizerData';
import { TeamStatusTable } from '../../components/organizer/TeamStatusTable';

export const TeamsManagePage: React.FC = () => {
    const { teams, isLoading } = useOrganizerData();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center">
                <Link to="/organizer/dashboard" className="text-slate-400 hover:text-white mr-6">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white">Team Management</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Participant Roster</h2>
                        <p className="text-slate-400">
                            Monitor submission statuses.
                        </p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex items-center">
                        <Users className="w-5 h-5 text-amber-400 mr-2" />
                        <span className="font-bold text-white">{teams.length} Teams</span>
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <TeamStatusTable teams={teams} />
                    )}
                </div>
            </main>
        </div>
    );
};
