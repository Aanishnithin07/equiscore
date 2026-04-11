import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { OwnResultCard } from '../../components/team/OwnResultCard';
import { api } from '../../api/client';

export const ResultsPage: React.FC = () => {
    // In a real application, you'd pull their exact active Job ID
    // We mock the polling for demonstration, assuming it is loaded or retrieved via API
    const isHackathonPublished = true;
    
    // We mock retrieving their result by generating a static load matching the backend contract
    const mockResult = {
        job_id: "example-uuid",
        status: "completed" as any,
        team_name: "Mock Team Beta",
        track: "ai_ml" as any,
        result: {
            overall_score: 87,
            track_alignment: "Excellent use of neural networks to classify the underlying data distributions realistically.",
            strengths: ["Great technical depth", "Clear business model"],
            weaknesses: ["UX requires more iteration", "Go-To-Market is weak"],
            rubric_scores: [
                { category: "Innovation", weight: 30, raw_score: 95, weighted_score: 28.5, one_line_justification: "" },
                { category: "Feasibility", weight: 30, raw_score: 75, weighted_score: 22.5, one_line_justification: "" },
                { category: "Presentation", weight: 40, raw_score: 90, weighted_score: 36.0, one_line_justification: "" }
            ]
        },
        error: null,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center">
                <Link to="/team/dashboard" className="text-slate-400 hover:text-white mr-6">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white">Evaluation Results</span>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto py-12 px-6">
                {!isHackathonPublished ? (
                    <div className="flex flex-col items-center justify-center h-[60vh]">
                        <div className="w-24 h-24 bg-amber-900/20 rounded-full flex items-center justify-center mb-8 border border-amber-500/30">
                            <Lock className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Results are Locked</h2>
                        <p className="text-slate-400 text-center max-w-md text-lg">
                            The organizers have not published the final results yet. You will be notified by email when scores are released.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                         <OwnResultCard 
                            teamName={mockResult.team_name}
                            result={mockResult.result as any}
                            jobId={mockResult.job_id}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};
