import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ds/Button/Button';

export interface JoinHackathonPageProps {
  onJoin?: (token: string) => void;
  isLoading?: boolean;
}

/**
 * @component JoinHackathonPage
 * @description Centered, minimal layout for invite redemption natively intercepting tokens without sidebar noise.
 */
export const JoinHackathonPage: React.FC<JoinHackathonPageProps> = ({ onJoin, isLoading }) => {
  const [token, setToken] = useState('devfest-vip-8x92');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please enter your invite token.');
      return;
    }
    setError(null);
    onJoin?.(token);
  };

  return (
    <div className="flex w-full h-[100dvh] items-center justify-center bg-[var(--bg-void)] relative overflow-hidden font-sans">
      <div className="mesh-primary opacity-60" aria-hidden="true" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-3 w-[440px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-8 shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full glass-2 flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)] border border-[var(--accent-400)]/30">
            <Ticket className="text-[var(--accent-400)]" size={20} />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="heading-3 text-white mb-2 font-['Sora']">Redeem Invite</h1>
          <p className="text-[13px] text-[var(--text-tertiary)]">Enter your secure token to securely link your account with the hackathon namespace.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div aria-live="polite" className="sr-only">{error ? `Form error: ${error}` : ''}</div>
          
          <div className="flex flex-col relative text-center">
            <label htmlFor="token" className="sr-only">Invite Token</label>
            <input 
              id="token" 
              type="text" 
              value={token} 
              onChange={e => setToken(e.target.value)} 
              placeholder="Paste your 16-character token"
              className={`h-[48px] glass-1 px-4 text-center rounded-[var(--radius-lg)] border-[0.5px] outline-none font-mono font-bold tracking-widest text-[16px] text-white transition-all
                  ${error && !token ? 'border-coral-400 animate-[shake_0.4s_ease-in-out]' : 'border-[var(--border-subtle)] focus:border-accent-400 focus:shadow-[0_0_0_3px_var(--accent-glow)]'}`}
            />
            
            <AnimatePresence>
                {error && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-1"><p className="text-[12px] text-coral-400 font-sans font-medium">{error}</p></motion.div>}
            </AnimatePresence>
          </div>

          <div className="mt-4">
            <Button type="submit" variant="primary" className="w-full h-[48px]" isLoading={isLoading} aria-label="Join via Token Button">
              CONFIRM AND JOIN
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border-ghost)] flex items-center justify-center gap-2 text-[var(--text-tertiary)] text-[11px] font-sans">
          <CheckCircle size={12} />
          <span>Tokens are single-use cryptographically bound parameters.</span>
        </div>
      </motion.div>
    </div>
  );
};
