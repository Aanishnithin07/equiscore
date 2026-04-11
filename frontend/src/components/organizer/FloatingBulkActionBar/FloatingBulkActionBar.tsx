// frontend/src/components/organizer/FloatingBulkActionBar/FloatingBulkActionBar.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, X } from 'lucide-react';
import { spring } from '../../../lib/motion-config';

interface Props {
  selectedCount: number;
  onClear: () => void;
  onGenerateReports: () => void;
  onExport: () => void;
}

/**
 * @component FloatingBulkActionBar
 * @description Injects elevated command bindings natively capturing batched DOM elements.
 */
export const FloatingBulkActionBar: React.FC<Props> = ({ selectedCount, onClear, onGenerateReports, onExport }) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div 
          initial={{ y: 80, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 80, opacity: 0, x: '-50%' }}
          transition={spring.snappy as any}
          className="fixed bottom-8 left-1/2 z-50 glass-4 px-6 py-3 rounded-full border border-[var(--accent-400)] shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_var(--accent-glow)] flex items-center gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--accent-400)] flex items-center justify-center font-bold text-white text-[12px]">
                {selectedCount}
            </div>
            <span className="font-sans font-bold text-white text-[14px]">Teams Selected</span>
          </div>

          <div className="w-[1px] h-6 bg-[var(--border-strong)] opacity-50" />

          <div className="flex items-center gap-2">
            <button 
                onClick={onGenerateReports}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)] hover:text-white"
            >
                <FileText size={16} /> <span className="font-sans text-[13px] font-medium">Generate Reports</span>
            </button>
            <button 
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)] hover:text-white"
            >
                <Download size={16} /> <span className="font-sans text-[13px] font-medium">Export CSV</span>
            </button>
          </div>

          <div className="w-[1px] h-6 bg-[var(--border-strong)] opacity-50" />

          <button onClick={onClear} className="text-[var(--text-tertiary)] hover:text-coral-400 p-2 rounded-full hover:bg-coral-400/10 transition-colors">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
