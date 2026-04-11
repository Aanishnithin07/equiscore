import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface PublishResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentStatus: string;
}

export const PublishResultsModal: React.FC<PublishResultsModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  currentStatus
}) => {
  if (!isOpen) return null;

  // Determine what the 'next' stage is based on current
  // Draft -> Open for submissions -> Judging -> Results published
  let nextVerb = '';
  let title = '';
  let consequenceText = '';
  let buttonColor = 'bg-amber-500 hover:bg-amber-600 text-slate-900';

  if (currentStatus === 'draft') {
      title = 'Open Submissions';
      nextVerb = 'Open';
      consequenceText = 'This will allow teams to start uploading their pitches. Ensure your tracks and rubric weights are finalized.';
      buttonColor = 'bg-teal-500 hover:bg-teal-600 text-slate-900';
  } else if (currentStatus === 'open') {
      title = 'Advance to Judging';
      nextVerb = 'Advance to Judging';
      consequenceText = 'This action will CLOSE submissions immediately. Teams will no longer be able to upload pitches. Existing pitch analysis will continue.';
  } else if (currentStatus === 'judging') {
      title = 'Publish Final Results';
      nextVerb = 'Publish Results';
      consequenceText = 'This will notify all teams via email and un-lock their results page allowing them to download the Growth Reports. THIS CANNOT BE UNDONE.';
      buttonColor = 'bg-coral-500 hover:bg-coral-600 text-white';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
         className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
         onClick={onClose}
      ></div>
      
      {/* Modal panel */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        <button 
           onClick={onClose}
           className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="flex items-center mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 
                ${currentStatus === 'judging' ? 'bg-coral-500/20 text-coral-500' : 'bg-amber-500/20 text-amber-500'}`}
            >
                {currentStatus === 'judging' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
            </div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>

        <p className="text-slate-300 text-lg mb-6 leading-relaxed">
            {consequenceText}
        </p>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
            <button 
                onClick={onClose}
                className="px-6 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${buttonColor}`}
            >
                Confirm & {nextVerb}
            </button>
        </div>
      </div>
    </div>
  );
};
