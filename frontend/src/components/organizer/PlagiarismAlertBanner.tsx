import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJudgeStore } from '../../stores/judgeStore';

export const PlagiarismAlertBanner: React.FC = () => {
    // The plagiarism alerts are fed via realtime websockets
    const alerts = useJudgeStore(state => state.plagiarismAlerts);

    if (alerts.length === 0) return null;

    return (
        <div className="bg-coral-500/10 border border-coral-500/50 rounded-xl p-4 flex items-start justify-between mb-8 shadow-sm">
            <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-coral-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                    <h4 className="text-coral-200 font-bold mb-1">
                        High Similarity Detected ({alerts.length} new flags)
                    </h4>
                    <p className="text-sm text-coral-200/80">
                        The AI semantic analyzer flagged submisssions sharing highly identical concepts exceeding the 85% safety threshold.
                        Latest trigger: {alerts[0].trigger_team || "Unknown"}
                    </p>
                </div>
            </div>
            <Link 
                to="/organizer/analytics" 
                className="bg-coral-500 hover:bg-coral-600 text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center transition-colors flex-shrink-0 ml-4"
            >
                Review Log <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
        </div>
    );
};
