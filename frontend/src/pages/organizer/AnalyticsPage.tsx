import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PieChart, BarChart } from 'lucide-react';
import { ScoreDistributionChart } from '../../components/organizer/ScoreDistributionChart';
import { TrackBreakdownChart } from '../../components/organizer/TrackBreakdownChart';
import { BiasAuditSection } from '../../components/organizer/BiasAuditSection';
import { useAuthStore } from '../../stores/authStore';

export const AnalyticsPage: React.FC = () => {
    const token = useAuthStore(state => state.accessToken);
    let hackathonId = 'dummy-fallback';
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            hackathonId = payload.hack_id || payload.sub || '';
        } catch (e) {}
    }
    
    // Mock robust distribution
    const scoreData = [
        { name: '0-10', count: 0, color: '#f43f5e' },
        { name: '10-20', count: 0, color: '#f43f5e' },
        { name: '20-30', count: 1, color: '#f43f5e' },
        { name: '30-40', count: 2, color: '#f43f5e' },
        { name: '40-50', count: 4, color: '#f43f5e' },
        { name: '50-60', count: 8, color: '#f43f5e' }, // fail
        { name: '60-70', count: 15, color: '#f59e0b' }, // average
        { name: '70-80', count: 22, color: '#f59e0b' }, // good
        { name: '80-90', count: 12, color: '#14b8a6' }, // extremely good
        { name: '90-100', count: 3, color: '#14b8a6' }, // master
    ];

    const trackData = [
        { name: 'Healthcare', value: 25, color: '#f43f5e' },
        { name: 'AI/ML', value: 45, color: '#06b6d4' },
        { name: 'Open Innovation', value: 30, color: '#8b5cf6' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center">
                <Link to="/organizer/dashboard" className="text-slate-400 hover:text-white mr-6">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white">Event Analytics</span>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto py-12 px-6">
                
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Metrics Dashboard</h2>
                    <p className="text-slate-400">Holistic overview of submission quality, AI scoring parity, and event distribution.</p>
                </header>

                <div className="mb-12">
                    <BiasAuditSection hackathonId={hackathonId} />
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Score Distribution */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center mb-6">
                            <BarChart className="w-6 h-6 text-teal-400 mr-3" />
                            <h3 className="text-xl font-bold text-white">Score Distribution</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            Displays the bell curve spread of overall evaluation scores assigned by the AI engine.
                        </p>
                        <ScoreDistributionChart data={scoreData} medianScore={74} />
                        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm">
                            <span className="text-slate-400">Mean: <span className="font-bold text-white ml-1">72.4</span></span>
                            <span className="text-slate-400">High: <span className="font-bold text-teal-400 ml-1">94</span></span>
                            <span className="text-slate-400">Low: <span className="font-bold text-coral-400 ml-1">28</span></span>
                        </div>
                    </div>

                    {/* Track Breakdown */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center mb-6">
                            <PieChart className="w-6 h-6 text-amber-400 mr-3" />
                            <h3 className="text-xl font-bold text-white">Track Popularity</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            Visualization of team distribution across predefined hackathon challenges.
                        </p>
                        <TrackBreakdownChart data={trackData} />
                    </div>
                </div>

            </main>
        </div>
    );
};
