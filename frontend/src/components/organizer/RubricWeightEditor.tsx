import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export interface RubricCategoryWeight {
    category: string;
    weight: number;
}

interface RubricWeightEditorProps {
    initialWeights: RubricCategoryWeight[];
    onSave: (weights: RubricCategoryWeight[]) => Promise<void>;
}

export const RubricWeightEditor: React.FC<RubricWeightEditorProps> = ({ initialWeights, onSave }) => {
    const [weights, setWeights] = useState<RubricCategoryWeight[]>(initialWeights);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setWeights(initialWeights);
    }, [initialWeights]);

    const handleSliderChange = (idx: number, newVal: number) => {
        const copy = [...weights];
        copy[idx].weight = newVal;
        setWeights(copy);
    };

    const totalWeight = weights.reduce((acc, obj) => acc + obj.weight, 0);
    const isError = totalWeight !== 100;

    const handleSave = async () => {
        if (isError) return;
        setIsSaving(true);
        try {
            await onSave(weights);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-white mb-2">Rubric Weighting</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-lg">
                Adjust how the AI calculates the final score. The total must exactly equal 100%. Categories affect specific AI agent behaviors.
            </p>

            <div className="space-y-6 mb-8">
                {weights.map((w, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">{w.category}</label>
                            <span className="text-amber-400 font-mono font-bold">{w.weight}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={w.weight}
                            onChange={(e) => handleSliderChange(idx, Number(e.target.value))}
                            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-700 pt-6">
                <div className="flex items-center space-x-4">
                    <div className="flex items-baseline space-x-2">
                        <span className="text-slate-400 font-medium">Total:</span>
                        <span className={`text-2xl font-mono font-bold ${isError ? 'text-coral-500' : 'text-teal-400'}`}>
                            {totalWeight}%
                        </span>
                    </div>
                    {isError && (
                        <div className="flex items-center text-coral-500 text-sm font-medium bg-coral-500/10 px-3 py-1 rounded-lg">
                            <AlertCircle className="w-4 h-4 mr-2" /> Must equal 100%
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    disabled={isError || isSaving}
                    className={`inline-flex items-center px-6 py-2 rounded-lg font-bold transition-colors shadow focus:outline-none
                        ${isError || isSaving 
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                            : 'bg-teal-500 hover:bg-teal-600 text-slate-900'
                        }
                    `}
                >
                    {isSaving ? 'Saving...' : (
                        <>
                           <Save className="w-4 h-4 mr-2" /> Save Weights
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
