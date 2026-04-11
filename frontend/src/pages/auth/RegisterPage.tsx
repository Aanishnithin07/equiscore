import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ds/Button/Button';

export interface RegisterPageProps {
  onRegister?: (credentials: { email: string; name: string; slug: string }) => void;
  onNavigateLogin?: () => void;
}

/**
 * @component RegisterPage
 * @description The Registration variation of the cinematic auth layout. Employs identical 55/45 structural limits.
 */
export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slug, setSlug] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !slug || !name) {
      setError('Please complete all required fields.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onRegister?.({ email, name, slug });
    }, 1200);
  };

  return (
    <div className="flex w-full h-[100dvh] overflow-hidden bg-[var(--bg-void)] font-sans text-white">
      {/* LEFT HERO */}
      <div className="w-[55%] h-full relative flex flex-col justify-center pl-20 overflow-hidden shrink-0">
        <div className="mesh-primary opacity-80" aria-hidden="true" />
        
        {/* Floating Logo + Particles */}
        <div className="relative mb-8 w-[120px] h-[120px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-teal-400/20 shadow-[0_0_40px_var(--teal-glow)] animate-pulse" />
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="relative z-10 drop-shadow-xl">
                <defs>
                    <linearGradient id="hero-grad-reg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-400)" />
                    <stop offset="100%" stopColor="var(--teal-400)" />
                    </linearGradient>
                </defs>
                <path d="M4 6H12M4 12H12M4 18H20M14 6H20M14 12H20" stroke="url(#hero-grad-reg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="absolute inset-0 preserve-3d" aria-hidden="true">
                {[...Array(8)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full motion-safe:animate-[spin_var(--dur)_linear_infinite]"
                        style={{
                            '--dur': `${4 + i * 1.5}s`,
                            transformOrigin: `${40 + i * 10}px center`,
                            backgroundColor: i % 3 === 0 ? 'var(--accent-400)' : i % 2 === 0 ? 'var(--teal-400)' : 'var(--coral-400)',
                            opacity: 0.4 + (i * 0.05)
                        } as React.CSSProperties}
                    />
                ))}
            </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 mb-8" aria-label="Join the Hackathon revolution">
            <h1 className="font-sans text-[18px] text-[var(--text-secondary)] mb-1">Assemble your team for</h1>
            <h2 className="font-['Sora'] text-[28px] font-bold text-white overflow-hidden leading-tight flex">
                <motion.span initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
                    Global Scale Events
                </motion.span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} className="text-[var(--accent-400)] ml-[1px]">.</motion.span>
            </h2>
        </div>

        <ul className="flex flex-col gap-3 relative z-10">
            {['Register securely', 'Link with teammates', 'Deploy submissions instantly'].map((f, i) => (
                <motion.li key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + (i * 0.2), duration: 0.5 }} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent-400/10 flex items-center justify-center shrink-0">
                        <ShieldCheck size={12} className="text-[var(--accent-400)]" />
                    </div>
                    <span className="font-sans text-[14px] text-[var(--text-secondary)]">{f}</span>
                </motion.li>
            ))}
        </ul>
      </div>

      {/* RIGHT FORM */}
      <div className="w-[45%] h-full flex items-center justify-end flex-shrink-0 z-20">
        <div className="glass-3 w-full max-w-[500px] h-full lg:h-auto lg:min-h-[85vh] rounded-l-[40px] border-l border-y border-[var(--border-subtle)] p-12 flex flex-col justify-center shadow-[-30px_0_60px_rgba(0,0,0,0.3)]">
            
            <AnimatePresence mode="wait">
                <motion.div key="register" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-[360px] mx-auto">
                    <header className="mb-8">
                        <h2 className="heading-2 text-white mb-2 font-['Sora']">Create Account</h2>
                        <p className="text-[14px] text-[var(--text-tertiary)]">Join your designated workspace instantly</p>
                    </header>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative" noValidate>
                        <div aria-live="polite" className="sr-only">{error ? `Form error: ${error}` : ''}</div>

                        <div className="flex flex-col">
                            <label htmlFor="name" className="microlabel text-[var(--text-tertiary)] mb-1.5">Full Name</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Dev" className={`h-[44px] glass-1 px-4 rounded-[var(--radius-md)] border-[0.5px] outline-none font-sans text-[15px] transition-all ${error && !name ? 'border-coral-400 animate-[shake_0.4s_ease-in-out]' : 'border-[var(--border-default)] focus:border-accent-400 focus:shadow-[0_0_0_3px_var(--accent-glow)]'}`}/>
                        </div>

                        <div className="flex flex-col relative">
                            <label htmlFor="slug" className="microlabel text-[var(--text-tertiary)] mb-1.5">Workspace Slug</label>
                            <input id="slug" type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. devfest-2025" className={`h-[44px] glass-1 px-4 rounded-[var(--radius-md)] border-[0.5px] outline-none font-sans text-[15px] transition-all ${error && !slug ? 'border-coral-400 animate-[shake_0.4s_ease-in-out]' : 'border-[var(--border-default)] focus:border-accent-400 focus:shadow-[0_0_0_3px_var(--accent-glow)]'}`}/>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="email" className="microlabel text-[var(--text-tertiary)] mb-1.5">Email Address</label>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" className={`h-[44px] glass-1 px-4 rounded-[var(--radius-md)] border-[0.5px] outline-none font-sans text-[15px] transition-all ${error && !email ? 'border-[var(--coral-400)] animate-[shake_0.4s_ease-in-out]' : 'border-[var(--border-default)] focus:border-[var(--accent-400)] focus:shadow-[0_0_0_3px_var(--accent-glow)]'}`}/>
                        </div>

                        <div className="flex flex-col relative">
                            <label htmlFor="password" className="microlabel text-[var(--text-tertiary)] mb-1.5">Password</label>
                            <div className="relative">
                                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={`w-full h-[44px] glass-1 pl-4 pr-10 rounded-[var(--radius-md)] border-[0.5px] outline-none font-sans text-[15px] transition-all ${error && !password ? 'border-[var(--coral-400)] animate-[shake_0.4s_ease-in-out]' : 'border-[var(--border-default)] focus:border-[var(--accent-400)] focus:shadow-[0_0_0_3px_var(--accent-glow)]'}`}/>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-white transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                                    <AnimatePresence mode="wait">
                                        {showPassword ? <motion.div key="hide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><EyeOff size={16} /></motion.div> : <motion.div key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Eye size={16} /></motion.div>}
                                    </AnimatePresence>
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="text-[12px] text-coral-400 font-sans font-medium mt-[-4px]">{error}</p></motion.div>}
                        </AnimatePresence>

                        <div className="mt-2">
                            <Button type="submit" variant="primary" className="w-full h-[48px]" isLoading={isLoading} aria-label="Register Button">CREATE ACCOUNT</Button>
                        </div>
                    </form>

                    <div className="mt-6 flex flex-col items-center">
                        <div className="flex items-center w-full max-w-[200px] mb-4">
                            <div className="flex-1 h-[0.5px] bg-[var(--border-ghost)]" />
                            <span className="mx-4 text-[12px] text-[var(--text-tertiary)]">or</span>
                            <div className="flex-1 h-[0.5px] bg-[var(--border-ghost)]" />
                        </div>
                        <button type="button" onClick={onNavigateLogin} className="group font-sans text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-1">
                            Already have an account? Sign in
                            <motion.span className="inline-block" whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }}>→</motion.span>
                        </button>
                    </div>

                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
