import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, ShieldAlert, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../api/client';

export const BiasAuditSection: React.FC<{ hackathonId: string }> = ({ hackathonId }) => {
    const queryClient = useQueryClient();
    const [auditExpanded, setAuditExpanded] = useState(true);

    const { data: report, isLoading } = useQuery({
        queryKey: ['biasReport', hackathonId],
        queryFn: () => api.getBiasReport(hackathonId)
    });

    const runMutation = useMutation({
        mutationFn: () => api.getBiasReport(hackathonId, true),
        onSuccess: (data) => {
            queryClient.setQueryData(['biasReport', hackathonId], data);
        }
    });

    if (isLoading && !report) {
        return <div className="animate-pulse bg-gray-800 h-32 rounded-lg"></div>;
    }

    if (!report) {
        return null;
    }

    const { overall_bias_risk, methodology_note, bias_tests, recommended_actions } = report;
    
    const riskColors: Record<string, string> = {
        low: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        moderate: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        high: 'bg-rose-500/10 border-rose-500/30 text-rose-400'
    };

    return (
        <div className={`mt-8 border rounded-xl overflow-hidden ${riskColors[overall_bias_risk]}`}>
            <div className="flex justify-between items-center p-6 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center">
                    {overall_bias_risk === 'low' ? (
                        <Shield className="w-8 h-8 mr-4 text-emerald-400" />
                    ) : (
                        <ShieldAlert className="w-8 h-8 mr-4 text-amber-400" />
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center">
                            Anti-Bias Evaluation Engine
                            <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gray-800 border border-gray-700">
                                BETA
                            </span>
                        </h2>
                        <p className="text-sm mt-1 opacity-80">
                            Overall Parity Risk: <strong className="uppercase">{overall_bias_risk}</strong>
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => runMutation.mutate()}
                    disabled={runMutation.isPending}
                    className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700 disabled:opacity-50"
                >
                    <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
                    {runMutation.isPending ? 'Crunching Matrices...' : 'Run Mathematical Audit'}
                </button>
            </div>

            <div className="p-6 bg-[#0B0F19]">
                <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {bias_tests.map((test: any, idx: number) => (
                        <div key={idx} className="bg-gray-800/50 p-4 rounded-lg border border-gray-800 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-200">{test.test_name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1" title={test.hypothesis}>{test.hypothesis}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${test.bias_detected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                    {test.bias_detected ? 'FLAGGED' : 'CLEAN'}
                                </span>
                            </div>
                            
                            <p className="text-sm text-gray-300 min-h-[40px]">{test.interpretation}</p>
                            
                            {/* P-value gauge */}
                            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-mono text-gray-500">
                                <span>p = {test.p_value.toFixed(4)}</span>
                                <div className="flex-1 mx-3 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${test.bias_detected ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                        style={{ width: `${Math.max(5, (1 - test.p_value) * 100)}%` }}
                                    ></div>
                                </div>
                                <span>r = {test.result.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {recommended_actions.length > 0 && (
                    <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-bold text-indigo-300 mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Actionable Safeguards
                        </h4>
                        <ul className="list-disc list-inside text-sm text-indigo-200/80 space-y-1">
                            {recommended_actions.map((act: string, i: number) => <li key={i}>{act}</li>)}
                        </ul>
                    </div>
                )}

                <div className="border-t border-gray-800/50 pt-4 mt-6">
                    <button 
                        onClick={() => setAuditExpanded(!auditExpanded)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-300 flex items-center"
                    >
                        Methodology Notice {auditExpanded ? <ChevronUp className="ml-1 w-3 h-3"/> : <ChevronDown className="ml-1 w-3 h-3"/>}
                    </button>
                    {auditExpanded && (
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                            {methodology_note}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
