// frontend/src/components/organizer/InviteCreator/InviteCreator.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Copy, Check, Plus } from 'lucide-react';
import { Button } from '../../ds/Button/Button';
import { spring } from '../../../lib/motion-config';

interface Props {
  onGenerate: (role: 'judge' | 'organizer', trackId?: string) => Promise<string>;
}

/**
 * @component InviteCreator
 * @description Generates access tokens surfacing precise physics-driven layout animations
 * encapsulating "Magic Link" feedback naturally.
 */
export const InviteCreator: React.FC<Props> = ({ onGenerate }) => {
  const [role, setRole] = useState<'judge' | 'organizer'>('judge');
  const [trackId, setTrackId] = useState('health');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedLink(null);
    try {
        const link = await onGenerate(role, role === 'judge' ? trackId : undefined);
        setGeneratedLink(link);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full glass-2 rounded-xl border border-[var(--border-default)] p-6">
        <h3 className="heading-3 text-white mb-6 flex items-center gap-2">
            Generate Magic Link
        </h3>

        <div className="flex gap-4 mb-6">
            <div className="flex-1 flex flex-col gap-2">
                <span className="microlabel text-[var(--text-tertiary)]">TARGET ROLE</span>
                <select 
                    value={role} onChange={e => setRole(e.target.value as any)}
                    className="h-[44px] glass-1 border border-[var(--border-subtle)] rounded-lg px-3 text-[14px] text-white outline-none cursor-pointer focus:border-[var(--accent-400)] transition-colors"
                >
                    <option value="judge">Judge</option>
                    <option value="organizer">Organizer Manager</option>
                </select>
            </div>

            {role === 'judge' && (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                    className="flex-1 flex flex-col gap-2"
                >
                    <span className="microlabel text-[var(--text-tertiary)]">ASSIGN TRACK (OPTIONAL)</span>
                    <select 
                        value={trackId} onChange={e => setTrackId(e.target.value)}
                        className="h-[44px] glass-1 border border-[var(--border-subtle)] rounded-lg px-3 text-[14px] text-white outline-none cursor-pointer focus:border-[var(--accent-400)] transition-colors"
                    >
                        <option value="health">Healthcare</option>
                        <option value="ai">AI/ML</option>
                        <option value="open">Open Innovation</option>
                    </select>
                </motion.div>
            )}
        </div>

        <Button 
            variant="primary" 
            isLoading={isGenerating} 
            onClick={handleGenerate}
            className="w-[200px]"
        >
            <Plus size={16} /> GENERATE LINK
        </Button>

        <AnimatePresence>
            {generatedLink && (
                <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={spring.snappy as any}
                    className="overflow-hidden"
                >
                    <div className="w-full h-[48px] bg-[var(--bg-void)] border border-[var(--border-strong)] rounded-lg flex items-center p-1 pl-4">
                        <Link size={16} className="text-[var(--text-tertiary)] shrink-0" />
                        <div className="flex-1 min-w-0 px-3">
                            <span className="font-mono text-[13px] text-white truncate w-full block">{generatedLink}</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            className={`shrink-0 w-[120px] h-full rounded justify-center transition-colors ${copied ? '!text-teal-400 bg-teal-400/10' : ''}`}
                            onClick={handleCopy}
                        >
                            {copied ? <><Check size={16} className="mr-2"/> COPIED</> : <><Copy size={16} className="mr-2"/> COPY</>}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};
