import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubmission } from '../../hooks/useSubmission';
import { FileUploadZone } from '../../components/team/FileUploadZone';
import { SubmissionStatus } from '../../components/team/SubmissionStatus';
import { TrackEnum } from '../../types/evaluation';

export const SubmissionPage: React.FC = () => {
    const { user } = useAuth();
    const { 
        uploadPitch, isUploading, uploadProgress, 
        evalStatus, isPolling, error: uploadError 
    } = useSubmission();

    const [selectedTrack, setSelectedTrack] = useState<TrackEnum | null>(null);
    const [pitchFile, setPitchFile] = useState<File | null>(null);
    const [behaviorFile, setBehaviorFile] = useState<File | null>(null);
    const [includeBehavior, setIncludeBehavior] = useState(false);

    const tracks: { id: TrackEnum; label: string }[] = [
        { id: 'healthcare', label: 'Healthcare' },
        { id: 'ai_ml', label: 'AI/ML' },
        { id: 'open_innovation', label: 'Open Innovation' }
    ];

    const handleSubmit = async () => {
        if (!selectedTrack || !pitchFile || !user) return;
        
        await uploadPitch(
            user.fullName || 'Anonymous Team', 
            selectedTrack, 
            pitchFile, 
            includeBehavior && behaviorFile ? behaviorFile : undefined
        );
    };

    const isSubmitting = isUploading || isPolling;
    const isCompleted = evalStatus?.status === 'completed' || evalStatus?.status === 'failed';

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center">
                <Link to="/team/dashboard" className="text-slate-400 hover:text-white mr-6">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white">Project Submission</span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-8 px-6">
                
                <div className="mb-8 p-4 bg-teal-900/10 border border-teal-500/20 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-teal-400 mb-1">Hackathon Status</p>
                        <p className="text-slate-300">Submissions are currently open.</p>
                    </div>
                </div>

                {isSubmitting || isCompleted ? (
                    <SubmissionStatus 
                        status={evalStatus?.status || (isUploading ? 'pending' : null)}
                        error={uploadError || evalStatus?.error}
                        isHackathonPublished={false} // Would come from store
                    />
                ) : (
                    <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-xl space-y-10">
                        {/* Track Selection */}
                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">1. Select your Track</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Your submission will be evaluated ONLY against this track's rubric. Choose carefully.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {tracks.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTrack(t.id)}
                                        className={`px-6 py-3 rounded-full font-medium text-sm transition-all border
                                            ${selectedTrack === t.id 
                                                ? 'bg-teal-500 text-slate-900 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                                                : 'bg-slate-900 text-slate-300 border-slate-600 hover:border-teal-500/50 hover:text-white'
                                            }
                                        `}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Pitch Deck Upload */}
                        <section>
                            <h3 className="text-lg font-bold text-white mb-2">2. Upload Pitch Deck</h3>
                            <FileUploadZone 
                                label="We securely process text, images, and standard formatting styles to analyze your deck."
                                acceptedMimeTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']}
                                maxSizeBytes={50 * 1024 * 1024} // 50MB
                                selectedFile={pitchFile}
                                onFileSelect={setPitchFile}
                                iconType="document"
                            />
                        </section>

                        {/* Behavioral Assessment Upload (Optional) */}
                        <section className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">3. Behavioral Audio (Optional)</h3>
                                    <p className="text-sm text-slate-400 mt-1 max-w-lg">
                                        Submit a recording of your pitch delivery for psychological & tone analysis to improve your score.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={includeBehavior}
                                        onChange={(e) => setIncludeBehavior(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                                </label>
                            </div>

                            {includeBehavior && (
                                <div className="mt-6 pt-6 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-4">
                                     <FileUploadZone 
                                        label="Supported formats: MP3, M4A, WAV, MP4"
                                        acceptedMimeTypes={['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a', 'video/mp4']}
                                        maxSizeBytes={25 * 1024 * 1024} // 25MB
                                        selectedFile={behaviorFile}
                                        onFileSelect={setBehaviorFile}
                                        iconType="audio"
                                    />
                                </div>
                            )}
                        </section>

                        <div className="pt-6 border-t border-slate-700 flex justify-end items-center">
                            {uploadError && (
                                <p className="text-coral-500 text-sm mr-6 font-medium bg-coral-900/20 px-3 py-1 rounded">
                                    {uploadError}
                                </p>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedTrack || !pitchFile || isUploading}
                                className="inline-flex items-center bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-3 px-8 rounded-lg transition-colors"
                            >
                                {isUploading ? 'Starting Upload...' : (
                                    <>
                                        Submit for Evaluation <Send className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
