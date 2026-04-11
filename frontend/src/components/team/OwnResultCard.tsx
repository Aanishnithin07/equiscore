import React, { useState } from 'react';
import { Download, Quote, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { LLMEvaluationOutput } from '../../types/evaluation';
import { api, apiClient } from '../../api/client';

interface OwnResultCardProps {
  teamName: string;
  result: LLMEvaluationOutput;
  reportJobId?: string; // Optional if we fetch it separately
  jobId: string;
}

export const OwnResultCard: React.FC<OwnResultCardProps> = ({ teamName, result, jobId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportError, setReportError] = useState('');

  const handleDownloadReport = async () => {
    setIsGenerating(true);
    setReportError('');
    try {
      // We will loop request until it downloads because we use a browser anchor tag to download
      // but to poll standard logic we should hit a generic api that triggers creation and downloads
      // We can use the Axios instance directly to get binary blob.
      
      const res = await apiClient.post(`/reports/generate/${jobId}`, {}, {
         baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
      });
      const generatedReportJobId = res.data.report_job_id;
      
      // Polling download logic manually
      let isReady = false;
      while(!isReady) {
        const downloadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/reports/${generatedReportJobId}/download`, {
            headers: {
                'Authorization': `Bearer ${window.sessionStorage.getItem('equiscore-auth') ? JSON.parse(window.sessionStorage.getItem('equiscore-auth') as string).state.accessToken : ''}`
            }
        });
        
        if (downloadRes.status === 202) {
             await new Promise(r => setTimeout(r, 2000));
        } else if (downloadRes.status === 200) {
             isReady = true;
             const blob = await downloadRes.blob();
             const url = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = `${teamName}_EquiScore_GrowthReport.pdf`;
             document.body.appendChild(a);
             a.click();
             a.remove();
        } else {
             throw new Error("Failed to download.");
        }
      }
      
    } catch (err: any) {
      setReportError('Failed to generate or download the report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 max-w-4xl mx-auto">
       <div className="p-8 border-b border-slate-700 bg-slate-800/50 flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-teal-400 font-mono text-sm tracking-widest uppercase mb-1">Final Results</p>
            <h2 className="text-3xl font-bold text-white">{teamName}</h2>
          </div>
          
          <div className="mt-6 md:mt-0 flex items-center justify-center">
             <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" className="stroke-current text-slate-700" strokeWidth="12" fill="none" />
                    <circle 
                       cx="64" cy="64" r="56" 
                       className={`stroke-current ${result.overall_score >= 80 ? 'text-teal-400' : result.overall_score >= 60 ? 'text-amber-400' : 'text-coral-500'}`} 
                       strokeWidth="12" fill="none" 
                       strokeDasharray="351" strokeDashoffset={351 - (351 * result.overall_score) / 100}
                       strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-black text-white">{result.overall_score}</span>
                    <span className="text-xs text-slate-400 font-medium">/ 100</span>
                </div>
             </div>
          </div>
       </div>

       <div className="p-8 space-y-10">
          
          {/* Track Alignment Quote */}
          <div className="relative p-6 bg-slate-900 border-l-4 border-teal-500 rounded-r-lg">
             <Quote className="absolute top-4 right-4 w-8 h-8 text-slate-700 opacity-50" />
             <p className="text-slate-300 text-lg italic leading-relaxed z-10 relative">
               "{result.track_alignment}"
             </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             {/* Strengths */}
             <div>
                <h4 className="flex items-center text-teal-400 font-bold mb-4 uppercase tracking-wider text-sm">
                   <CheckCircle2 className="w-5 h-5 mr-2" /> Top Strengths
                </h4>
                <ul className="space-y-3">
                   {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start">
                         <span className="text-teal-500 mr-2 mt-1">•</span>
                         <span className="text-slate-300">{s}</span>
                      </li>
                   ))}
                </ul>
             </div>

             {/* Weaknesses */}
             <div>
                <h4 className="flex items-center text-coral-400 font-bold mb-4 uppercase tracking-wider text-sm">
                   <XCircle className="w-5 h-5 mr-2" /> Areas for Improvement
                </h4>
                <ul className="space-y-3">
                   {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start">
                         <span className="text-coral-500 mr-2 mt-1">•</span>
                         <span className="text-slate-300">{w}</span>
                      </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* Rubric Breakdown */}
          <div>
            <h4 className="flex items-center text-slate-200 font-bold mb-6 uppercase tracking-wider text-sm border-b border-slate-700 pb-2">
               <Activity className="w-5 h-5 mr-2 text-amber-500" /> Rubric Breakdown
            </h4>
            <div className="space-y-4">
               {result.rubric_scores.map((score, i) => (
                  <div key={i} className="bg-slate-900/50 p-4 rounded-lg flex items-center">
                     <div className="w-1/3 pr-4">
                        <p className="text-slate-200 font-medium truncate">{score.category}</p>
                        <p className="text-xs text-slate-500">Weight: {score.weight}%</p>
                     </div>
                     <div className="w-2/3">
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-amber-400 font-bold">{score.raw_score} / 100</span>
                           <span className="text-slate-400">Yields: {score.weighted_score.toFixed(1)}pts</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                           <div 
                              className={`h-2 rounded-full ${score.raw_score >= 80 ? 'bg-teal-500' : score.raw_score >= 60 ? 'bg-amber-500' : 'bg-coral-500'}`}
                              style={{ width: `${score.raw_score}%` }}
                           ></div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          </div>
          
          {/* Download Report */}
          <div className="pt-6 border-t border-slate-700 text-center">
             <button
                onClick={handleDownloadReport}
                disabled={isGenerating}
                className="inline-flex items-center bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/50 font-medium py-3 px-6 rounded-lg transition-colors"
             >
                {isGenerating ? (
                   <>
                     <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mr-3"></div>
                     Generating PDF...
                   </>
                ) : (
                   <>
                     <Download className="w-5 h-5 mr-3" />
                     Download Detailed Growth Report
                   </>
                )}
             </button>
             {reportError && <p className="text-coral-500 text-sm mt-3">{reportError}</p>}
          </div>

       </div>
    </div>
  );
};
