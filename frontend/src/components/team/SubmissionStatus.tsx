import React from 'react';
import { UploadCloud, FileText, Cpu, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { EvaluationStatusEnum } from '../../types/evaluation';

interface SubmissionStatusProps {
  status: EvaluationStatusEnum | null;
  error?: string | null;
  isHackathonPublished?: boolean;
}

export const SubmissionStatus: React.FC<SubmissionStatusProps> = ({ 
  status, 
  error,
  isHackathonPublished = false 
}) => {
  
  // Logical mapping of API statuses to UI progress steps
  // 1. Uploaded (job created, technically status=pending)
  // 2. Extracting (celery task picked up, status=processing) -> actually processing means both extracting and AI evaluating
  // so we mock step 3 if status=processing
  
  const getStepState = (stepNumber: number) => {
    if (!status) return 'pending';
    
    if (status === 'failed') {
      if (stepNumber === 4) return 'failed';
      return 'completed'; // everything before failed is assumed completed, or failed during processing
    }
    
    if (status === 'completed') return 'completed';
    
    if (status === 'processing') {
      // Step 1 done, 2 done, 3 active, 4 pending
      if (stepNumber <= 2) return 'completed';
      if (stepNumber === 3) return 'active';
      return 'pending';
    }
    
    if (status === 'pending') {
      if (stepNumber === 1) return 'completed';
      if (stepNumber === 2) return 'active';
      return 'pending';
    }
    
    return 'pending';
  };

  const steps = [
    { title: 'Uploaded', icon: <UploadCloud />, desc: 'File received safely' },
    { title: 'Extracting Content', icon: <FileText />, desc: 'Parsing slides and media' },
    { title: 'AI Evaluating', icon: <Cpu />, desc: 'Evaluating against rubric (~30s)' },
    { title: status === 'failed' ? 'Failed' : 'Complete', icon: status === 'failed' ? <AlertCircle /> : <CheckCircle />, desc: 'Evaluation saved' },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-xl max-w-2xl mx-auto mt-8">
      <h3 className="text-xl font-bold text-white mb-8 text-center">Processing Your Submission</h3>
      
      <div className="space-y-6">
        {steps.map((step, index) => {
          const state = getStepState(index + 1);
          
          return (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                  ${state === 'completed' ? 'bg-teal-500/20 border-teal-500 text-teal-400' : ''}
                  ${state === 'active' ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse' : ''}
                  ${state === 'failed' ? 'bg-coral-500/20 border-coral-500 text-coral-400' : ''}
                  ${state === 'pending' ? 'border-slate-600 text-slate-500' : ''}
                `}>
                  {state === 'active' ? <Loader className="w-5 h-5 animate-spin" /> : <span className="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">{step.icon}</span>}
                </div>
              </div>
              <div className="ml-4 flex-grow border-b border-slate-700/50 pb-6 last:border-0 last:pb-0">
                <h4 className={`text-lg font-medium 
                  ${state === 'completed' || state === 'active' ? 'text-slate-200' : 'text-slate-500'}
                  ${state === 'failed' ? 'text-coral-400' : ''}
                `}>
                  {step.title}
                </h4>
                <p className={`text-sm mt-1 ${state === 'failed' ? 'text-coral-300' : 'text-slate-400'}`}>
                  {state === 'failed' && error ? error : step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {status === 'completed' && (
         <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col items-center">
            {isHackathonPublished ? (
                <a href="/team/results" className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-3 px-8 rounded-lg transition-colors inline-block text-center">
                    View Your Results
                </a>
            ) : (
                <div className="text-center px-4 py-3 bg-amber-900/20 border border-amber-500/50 rounded-lg max-w-md">
                    <p className="text-amber-400 font-medium flex items-center justify-center">
                        🔒 Results Locked
                    </p>
                    <p className="text-amber-200/70 text-sm mt-2">
                        Evaluation complete, but results are locked until the organizer publishes them.
                    </p>
                </div>
            )}
         </div>
      )}
    </div>
  );
};
