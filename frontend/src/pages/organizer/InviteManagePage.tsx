import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { InviteGenerator } from '../../components/organizer/InviteGenerator';

export const InviteManagePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center">
                <Link to="/organizer/dashboard" className="text-slate-400 hover:text-white mr-6">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white">Access & Invites</span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-12 px-6">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Participant Provisioning</h2>
                    <p className="text-slate-400">
                        Create secure invite links to onboard human judges or inject teams directly into your event. Links expire after their configured duration.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <InviteGenerator />
                    </div>
                    
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Invite Log</h3>
                        <p className="text-sm text-slate-400 mb-6">Recently generated invites and their redemption state.</p>
                        
                        <div className="space-y-4">
                            {/* Mock Data */}
                            <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                     <span className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded text-xs font-bold uppercase">Team</span>
                                     <span className="text-xs text-slate-500">2 days ago</span>
                                </div>
                                <p className="text-slate-300 text-sm mb-1 font-medium">Target: Innovate4Good</p>
                                <p className="text-amber-400 text-xs font-bold">REDEEMED</p>
                            </div>

                            <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                     <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-xs font-bold uppercase">Judge</span>
                                     <span className="text-xs text-slate-500">1 hour ago</span>
                                </div>
                                <p className="text-slate-300 text-sm mb-1 font-medium">Target: Any</p>
                                <p className="text-teal-400 text-xs font-bold flex items-center">
                                    PENDING <ExternalLink className="w-3 h-3 ml-1" />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
