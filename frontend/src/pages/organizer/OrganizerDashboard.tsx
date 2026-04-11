import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOrganizerData } from '../../hooks/useOrganizerData';
import { StatCard } from '../../components/organizer/StatCard';
import { PublishResultsModal } from '../../components/organizer/PublishResultsModal';
import { PlagiarismAlertBanner } from '../../components/organizer/PlagiarismAlertBanner';
import { 
    Users, Activity, TrendingUp, AlertTriangle, 
    Settings, PlayCircle, BarChart2, Link as LinkIcon 
} from 'lucide-react';

export const OrganizerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { stats, isLoading } = useOrganizerData();
    
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    
    // In a real app this is derived from the hackathon model
    const hackathonStatus = 'open'; 

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-amber-400 font-mono tracking-tighter">EquiScore</span>
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ml-4">
                        Organizer
                    </span>
                </div>
                <div className="flex items-center space-x-4 pr-10">
                    <span className="text-sm text-slate-400">{user?.email}</span>
                    <button onClick={logout} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Sign Out
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto py-12 px-6">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Hackathon Overview</h1>
                        <p className="text-slate-400 text-lg">
                            Current Status: <span className="text-teal-400 font-bold uppercase tracking-wider ml-1">{hackathonStatus}</span>
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsPublishModalOpen(true)}
                        className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-2 px-6 rounded-lg transition-colors flex items-center"
                    >
                        <PlayCircle className="w-5 h-5 mr-2" /> 
                        Advance Stage
                    </button>
                </header>

                <PlagiarismAlertBanner />

                {/* Top Level Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                     <StatCard 
                        title="Total Teams" 
                        value={isLoading ? '...' : stats?.totalSubmissions || 0} 
                        icon={Users}
                     />
                     <StatCard 
                        title="Average Score" 
                        value={isLoading ? '...' : (stats?.averageScore.toFixed(1) || '0.0')} 
                        icon={TrendingUp}
                        valueColor={stats?.averageScore && stats.averageScore > 80 ? 'text-teal-400' : 'text-amber-400'}
                     />
                     <StatCard 
                        title="Pending AI Analysis" 
                        value={isLoading ? '...' : stats?.pendingAnalysis || 0} 
                        icon={Activity}
                        valueColor="text-teal-400"
                     />
                     <StatCard 
                        title="Failed Extractions" 
                        value={isLoading ? '...' : stats?.failedSubmissions || 0} 
                        icon={AlertTriangle}
                        valueColor={stats?.failedSubmissions && stats.failedSubmissions > 0 ? "text-coral-500" : "text-slate-500"}
                     />
                </div>

                {/* Navigation Links */}
                <h3 className="text-xl font-bold text-white mb-6">Management Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     
                     <Link to="/organizer/teams" className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors group">
                         <div className="flex items-center mb-4 text-amber-400">
                             <Users className="w-8 h-8 mr-4" />
                             <h4 className="text-xl font-bold text-white">Teams & Submissions</h4>
                         </div>
                         <p className="text-slate-400 pl-12">View all teams, their submission status, and override AI scores if necessary.</p>
                     </Link>

                     <Link to="/organizer/analytics" className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors group">
                         <div className="flex items-center mb-4 text-amber-400">
                             <BarChart2 className="w-8 h-8 mr-4" />
                             <h4 className="text-xl font-bold text-white">Advanced Analytics</h4>
                         </div>
                         <p className="text-slate-400 pl-12">Dive into score distributions, track breakdowns, and performance metrics.</p>
                     </Link>

                     <Link to="/organizer/setup" className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors group">
                         <div className="flex items-center mb-4 text-amber-400">
                             <Settings className="w-8 h-8 mr-4" />
                             <h4 className="text-xl font-bold text-white">Hackathon Settings</h4>
                         </div>
                         <p className="text-slate-400 pl-12">Configure evaluation rubrics, category weights, and general settings.</p>
                     </Link>

                     <Link to="/organizer/invites" className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors group">
                         <div className="flex items-center mb-4 text-amber-400">
                             <LinkIcon className="w-8 h-8 mr-4" />
                             <h4 className="text-xl font-bold text-white">Invites Access</h4>
                         </div>
                         <p className="text-slate-400 pl-12">Generate secure URLs to invite human Judges or direct team links.</p>
                     </Link>

                </div>
            </main>

            <PublishResultsModal 
                isOpen={isPublishModalOpen}
                currentStatus={hackathonStatus}
                onClose={() => setIsPublishModalOpen(false)}
                onConfirm={() => console.log('Advancing workflow...')}
            />
        </div>
    );
};
