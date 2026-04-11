// frontend/src/components/ds/ReportDownloadCard/ReportDownloadCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { Button } from '../Button/Button';

interface Props {
  title?: string;
  pages?: number;
  onDownload: () => void;
}

/**
 * @component ReportDownloadCard
 * @description Unique full-width call-to-action injecting Shimmer overlays concurrently 
 * drawing explicit PDF exporting logic transparently natively.
 */
export const ReportDownloadCard: React.FC<Props> = ({ title = "Your Personalized Growth Report", pages = 5, onDownload }) => {
  return (
    <div className="w-full glass-2 rounded-[var(--radius-xl)] border border-[var(--border-default)] p-6 relative overflow-hidden group">
        {/* Animated Border Accent strictly bound to pseudo-element without harming layout */}
        <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-[var(--accent-400)] shadow-[0_0_15px_var(--accent-glow)]" />

        {/* Ambient Shimmer Sweep (CSS powered avoiding JS ticks) */}
        <div className="absolute inset-0 preserve-3d overflow-hidden rounded-xl border border-transparent pointer-events-none">
            <div className="w-[200%] h-[200%] block absolute top-[-50%] left-[-50%] opacity-20 transform -rotate-45"
                 style={{ background: 'linear-gradient(to right, transparent, var(--accent-400), transparent)' }}
                 {...{'className': 'motion-safe:animate-[shimmerSweep_4s_infinite_linear]'} as any}
            />
        </div>

        <div className="relative z-10 flex items-center justify-between w-full h-full gap-6">
            <div className="flex items-center gap-5 min-w-0">
                <div className="relative w-14 h-14 rounded-2xl glass-3 border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                    <FileText size={28} className="text-white" />
                    {/* Flipping pages illusion */}
                    <div className="absolute top-3 right-3 w-3 h-4 bg-white/20 border border-white/50 rounded-sm origin-bottom-right motion-safe:animate-[pageRiffle_3s_ease-out_infinite]" />
                    <div className="absolute top-4 right-2 w-3 h-4 bg-white/10 border border-white/30 rounded-sm origin-bottom-right motion-safe:animate-[pageRiffle_3s_ease-out_infinite] [animation-delay:0.1s]" />
                </div>
                <div className="flex flex-col justify-center text-left">
                    <h4 className="heading-4 text-white mb-1 group-hover:text-[var(--accent-400)] transition-colors">{title}</h4>
                    <span className="font-mono text-[12px] text-[var(--text-tertiary)] bg-[var(--bg-void)] px-2 py-0.5 rounded uppercase tracking-wider inline-block border border-[var(--border-ghost)]">
                        PDF · {pages} pages · Prepared by EquiScore AI
                    </span>
                </div>
            </div>

            <Button variant="primary" onClick={onDownload} className="shrink-0 flex items-center gap-2 pr-6" magnetic>
                <Download size={16} />
                DOWNLOAD REPORT
            </Button>
        </div>
    </div>
  );
};
