import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreRing } from '../../components/ds/ScoreRing/ScoreRing';
import { ReportDownloadCard } from '../../components/ds/ReportDownloadCard/ReportDownloadCard';
import { Button } from '../../components/ds/Button/Button';
import { Lock } from 'lucide-react';
import { spring } from '../../lib/motion-config';

export interface ScoreRevealPageProps {
  score: number;
  rank: number;
  totalTeams: number;
  advanced: boolean;
  onDownloadReport: () => void;
  onViewDetailedResults: () => void;
}

/**
 * @component ScoreRevealPage
 * @description The emotional climax of the Team Portal explicitly orchestrating full-screen dissolution arrays
 * preceding mathematical scoring animations securely.
 */
export const ScoreRevealPage: React.FC<ScoreRevealPageProps> = ({ score, rank, totalTeams, advanced, onDownloadReport, onViewDetailedResults }) => {
  const [showOverlay, setShowOverlay] = useState(true);

  // Drama sequence
  useEffect(() => {
    const t = setTimeout(() => setShowOverlay(false), 1600); // 1.2s + buffer
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex w-full h-[100dvh] bg-[var(--bg-void)] relative overflow-hidden font-sans">
      
      {/* BACKGROUND EFFECTS */}
      <div className="mesh-primary opacity-40 absolute inset-0" aria-hidden="true" />
      {advanced && <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 to-transparent pointer-events-none" />}

      {/* DRAMATIC REVEAL OVERLAY (Blocks interactions until cleared) */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div 
            key="overlay"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 z-50 bg-[var(--bg-void)] flex flex-col items-center justify-center p-8"
          >
             <motion.div 
                animate={{ scale: [0.95, 1], filter: ['blur(4px)', 'blur(0px)'] }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="flex flex-col items-center"
             >
                <div className="w-20 h-20 rounded-full border-[1px] border-[var(--accent-400)]/30 shadow-[0_0_40px_var(--accent-glow)] flex items-center justify-center mb-8 relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-accent-400 rounded-full animate-pulse" />
                </div>
                <h1 className="font-['Sora'] font-light text-[32px] tracking-widest text-white">Results are in...</h1>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT SEQUENCE */}
      {!showOverlay && (
        <div className="w-full h-full overflow-y-auto pb-24 z-10 custom-scrollbar flex flex-col items-center px-4 pt-16">
            
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="w-full max-w-3xl flex flex-col gap-8 items-center"
            >
                {/* Score Reveal Card */}
                <div className="w-full glass-3 mesh-card rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-12 flex flex-col items-center text-center relative overflow-hidden">
                    <span className="microlabel text-[var(--accent-400)] mb-10 tracking-widest">YOUR EQUISCORE</span>
                    
                    <div className="mb-10 w-[220px] h-[220px] relative">
                        {/* Huge Score Ring */}
                        <ScoreRing score={score} size="xl" />
                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] pointer-events-none" />
                    </div>

                    <p className="font-['Sora'] font-semibold text-[22px] text-white leading-tight max-w-lg mb-6">
                        "Strong objective structure paired with robust technical infrastructure."
                    </p>
                    
                    <div className="w-[120px] h-[2px] bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent mb-8" />
                    
                    {/* Rank Block */}
                    <div className={`relative flex flex-col items-center p-6 rounded-xl ${advanced ? 'bg-amber-400/5' : 'bg-[var(--bg-elevated)]'} min-w-[240px]`}>
                        {advanced && (
                            <div className="absolute inset-0 rounded-xl border border-amber-400/40 shadow-[0_0_20px_var(--amber-glow)] motion-safe:animate-pulse" />
                        )}
                        <span className="font-sans text-[13px] text-[var(--text-tertiary)] mb-1">You ranked</span>
                        <h2 className="font-['Sora'] font-bold text-[48px] leading-none mb-2 text-[var(--accent-400)] drop-shadow-[0_0_10px_var(--accent-glow)]">
                            #{rank}
                        </h2>
                        <span className="font-mono text-[12px] text-[var(--text-secondary)]">out of {totalTeams} teams</span>
                        
                        {advanced && (
                            <div className="absolute -top-3 bg-amber-400 text-black font-bold font-sans text-[10px] px-3 py-1 rounded-full tracking-widest">
                                ADVANCED TO FINALS
                            </div>
                        )}
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    className="w-full gap-4 flex flex-col pt-4"
                >
                    <ReportDownloadCard onDownload={onDownloadReport} />
                    
                    <Button variant="ghost" className="w-full mt-2" onClick={onViewDetailedResults}>
                        View Categorical Breakdown →
                    </Button>
                </motion.div>

            </motion.div>
        </div>
      )}
    </div>
  );
};
