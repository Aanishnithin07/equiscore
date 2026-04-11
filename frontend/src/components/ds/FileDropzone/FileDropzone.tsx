// frontend/src/components/ds/FileDropzone/FileDropzone.tsx
import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, X, FileText } from 'lucide-react';
import { Button } from '../Button/Button';
import { spring } from '../../../lib/motion-config';

type DropzoneState = 'idle' | 'dragging' | 'selected';

interface Props {
  file: File | null;
  onSelect: (file: File | null) => void;
}

/**
 * @component FileDropzone
 * @description The interactive Hero component parsing File selections routing states visually mapped to physical user drag limits.
 */
export const FileDropzone: React.FC<Props> = ({ file, onSelect }) => {
  const [state, setState] = useState<DropzoneState>(file ? 'selected' : 'idle');

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (state !== 'selected') setState('dragging');
  }, [state]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (state !== 'selected') setState('idle');
  }, [state]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSelect(e.dataTransfer.files[0]);
      setState('selected');
    } else {
      setState('idle');
    }
  }, [onSelect]);

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setState('idle');
  };

  const handleManualSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.pptx';
    input.onchange = (e: any) => {
        if (e.target.files && e.target.files.length > 0) {
            onSelect(e.target.files[0]);
            setState('selected');
        }
    };
    input.click();
  };

  // State checks
  const isDragging = state === 'dragging';
  const isSelected = state === 'selected';

  return (
    <motion.div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      layout
      transition={spring.bouncy as any} // smoothly swaps between 320px and 120px internally structurally
      className={`
        w-full relative rounded-[var(--radius-xl)] transition-all flex flex-col justify-center overflow-hidden
        ${isSelected ? 'h-[120px] glass-1 border-[1px] border-[var(--teal-400)] cursor-default' 
         : isDragging ? 'h-[320px] bg-[var(--accent-400)] bg-opacity-5 border-[2px] border-[var(--accent-400)] shadow-[0_0_80px_var(--accent-glow)]' 
         : 'h-[320px] glass-2 border-[1.5px] border-dashed border-[var(--border-default)] hover:bg-[var(--bg-elevated)] cursor-pointer'}
      `}
      onClick={!isSelected ? handleManualSelect : undefined}
    >
      {/* Marching Ants SVG Overlay completely customized native solution avoiding expensive border repaints */}
      {!isSelected && !isDragging && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-[var(--radius-xl)]">
            <rect width="100%" height="100%" rx="32" fill="none" stroke="var(--border-tertiary)" strokeWidth="2" strokeDasharray="16 8" className="motion-safe:animate-[marche_3s_linear_infinite]" />
        </svg>
      )}

      <AnimatePresence mode="popLayout">
        {!isSelected ? (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-8 z-10 w-full h-full pointer-events-none"
          >
            <motion.div 
                animate={{ scale: isDragging ? 1.2 : 1, y: isDragging ? 0 : [0, -6, 0] }}
                transition={isDragging ? (spring.bouncy as any) : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-6 drop-shadow-[0_0_15px_var(--accent-glow)]"
            >
                <CloudUpload size={48} className={isDragging ? 'text-[var(--accent-400)]' : 'text-white'} />
            </motion.div>
            
            <h3 className="heading-3 text-white mb-2 transition-colors">
                {isDragging ? 'Release to lock structure' : 'Drop your pitch deck here'}
            </h3>
            <p className="font-sans text-[13px] text-[var(--text-tertiary)] mb-6">PDF or PPTX · Max 50MB</p>
            
            <div className="flex items-center gap-4 w-64 mb-6">
                <div className="flex-1 h-[0.5px] bg-[var(--border-subtle)]" />
                <span className="text-[11px] font-sans text-[var(--text-tertiary)]">or</span>
                <div className="flex-1 h-[0.5px] bg-[var(--border-subtle)]" />
            </div>

            <div className="pointer-events-auto">
                <Button variant="primary" onClick={handleManualSelect} className="px-8 shadow-xl" magnetic>
                    Browse Files
                </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-8 z-10 w-full h-full"
          >
            <div className="flex items-center gap-5 min-w-0 flex-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-accent-400 flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <FileText size={24} className="text-white" />
                </div>
                <div className="flex flex-col justify-center min-w-0 pr-4">
                    <span className="font-['Sora'] font-semibold text-[16px] text-white truncate w-full block mb-1">
                        {file?.name || 'pitch_deck_vfinal.pdf'}
                    </span>
                    <span className="font-sans text-[12px] text-[var(--text-tertiary)]">
                        {file ? `${(file.size / (1024*1024)).toFixed(1)} MB` : '18.4 MB'} · ~32 slides estimated
                    </span>
                </div>
            </div>

            <button 
                onClick={removeFile}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-coral-400 hover:bg-coral-400/10 transition-colors shrink-0"
                aria-label="Remove uploaded file"
            >
                <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
