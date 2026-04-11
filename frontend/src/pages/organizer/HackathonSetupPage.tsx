import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RubricWeightEditor, RubricCategoryWeight } from '../../components/organizer/RubricWeightEditor';

export const HackathonSetupPage: React.FC = () => {
    
    // In real app, load this from API Settings
    const initialWeights = [
        { category: "Innovation", weight: 30 },
        { category: "Feasibility", weight: 30 },
        { category: "Presentation", weight: 40 }
    ];

    const handleSaveWeights = async (weights: RubricCategoryWeight[]) => {
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        console.log('Saved new weights to DB:', weights);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center">
                <Link to="/organizer/dashboard" className="text-slate-400 hover:text-white mr-6">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white">Setup & Rubric Tuning</span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-12 px-6">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Scoring Engine Configuration</h2>
                    <p className="text-slate-400">
                        These weights dictate how the LLM assigns final value to its raw evaluations. Changing this while parsing is happening will apply it retroactively to pending tasks.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <RubricWeightEditor 
                        initialWeights={initialWeights}
                        onSave={handleSaveWeights}
                    />
                </div>
            </main>
        </div>
    );
};
