import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export const TeamDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    
    // In a real application, we would hit API to see if they've already submitted
    // For now we assume they haven't to drive them to submission.
    const hasSubmitted = false;
    const isPublished = false;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-teal-400 font-mono tracking-tighter">EquiScore</span>
                    <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ml-4">
                        Team Portal
                    </span>
                </div>
                <div className="flex items-center space-x-4 pr-10">
                    <span className="text-sm text-slate-400">{user?.email}</span>
                    <button onClick={logout} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Sign Out
                    </button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto py-12 px-6">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user?.fullName || 'Team'}!</h1>
                    <p className="text-slate-400 text-lg">Manage your hackathon submission and view AI evaluation results.</p>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Submit Card */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-teal-500/50 transition-colors shadow-lg shadow-slate-900/50 group">
                        <div className="w-14 h-14 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-500/20">
                            <Upload className="w-7 h-7 text-teal-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Submit Pitch Deck</h2>
                        <p className="text-slate-400 mb-8 h-12">
                            Upload your slides and optional audio pitch for comprehensive AI evaluation against the hackathon rubric.
                        </p>
                        <Link 
                            to="/team/submit" 
                            className="inline-flex items-center justify-center w-full bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            {hasSubmitted ? 'Upload New Version' : 'Start Submission'}
                        </Link>
                    </div>

                    {/* Results Card */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-teal-500/50 transition-colors shadow-lg shadow-slate-900/50 group relative overflow-hidden">
                        
                        {!hasSubmitted && !isPublished && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg flex items-center text-slate-400 text-sm font-medium">
                                    <FileText className="w-4 h-4 mr-2" /> Complete submission to unlock
                                </div>
                            </div>
                        )}

                        <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20">
                            <CheckCircle className="w-7 h-7 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">View Evaluation</h2>
                        <p className="text-slate-400 mb-8 h-12">
                            Access your final scores, AI-generated strengths & weaknesses, and download your personalized growth report.
                        </p>
                        <Link 
                            to="/team/results" 
                            className="inline-flex items-center justify-center w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            View Results
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};
