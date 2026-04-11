// frontend/src/components/ds/CommandPalette/CommandPalette.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Monitor, BarChart, Users, FileText, ArrowRight, Download, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { spring } from '../../../lib/motion-config';

// Note: To implement this properly across the application, you render this exclusively 
// at the root Layout index layer to listen for document.keydown natively.

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Cmd+K Listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen]);

  const commands = [
    { group: 'Navigation', label: 'Go to Leaderboard', icon: Monitor, kbd: 'G L', act: () => navigate('/organizer/dashboard') },
    { group: 'Navigation', label: 'Go to Analytics', icon: BarChart, kbd: 'G A', act: () => navigate('/organizer/analytics') },
    { group: 'Navigation', label: 'Go to Teams Matrix', icon: Users, kbd: 'G T', act: () => navigate('/organizer/teams') },
    { group: 'Navigation', label: 'Go to Audit Report', icon: FileText, act: () => navigate('/organizer/analytics') },
    { group: 'Actions', label: 'Export Global CSV', icon: Download, act: () => console.log('Exporting CSV...') },
    { group: 'Actions', label: 'Run Automated Bias Audit', icon: Zap, act: () => console.log('Dispatch Audit...') },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (!isOpen) { 
        setSearch(''); 
        setSelectedIndex(0); 
    }
  }, [isOpen]);

  // Handle arrow routing mapping specifically isolated
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[selectedIndex]) {
                filtered[selectedIndex].act();
                setIsOpen(false);
            }
        }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, filtered, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="fixed inset-0 z-[9998]"
            style={{ background: 'oklch(0% 0 0 / 0.70)', backdropFilter: 'blur(8px)' }}
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: 'easeIn' } }}
              transition={spring.bouncy}
              className="glass-4 glass-noise overflow-hidden w-full max-w-[560px] pointer-events-auto shadow-2xl relative border border-gray-700/50"
              style={{ borderRadius: 'var(--radius-xl)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center px-4 h-14 border-b border-gray-800 border-opacity-50">
                <Search size={20} className="text-gray-500 mr-3" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search teams, jump to section..."
                  className="flex-1 bg-transparent text-white border-none outline-none text-[16px] font-sans placeholder:text-gray-600"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
                />
                <span className="bg-gray-800 text-gray-400 text-[10px] font-bold px-1.5 py-1 rounded border border-gray-700 ml-3">
                  ESC
                </span>
              </div>

              <div className="max-h-[360px] overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm font-sans">
                    No matching commands or teams found.
                  </div>
                ) : (
                  filtered.map((cmd, idx) => {
                    const isSelected = idx === selectedIndex;
                    const Icon = cmd.icon;
                    return (
                        <div 
                          key={idx}
                          className={`flex items-center h-11 px-4 cursor-pointer relative ${isSelected ? 'bg-gray-800/80' : 'hover:bg-gray-800/50'}`}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => { cmd.act(); setIsOpen(false); }}
                        >
                            {isSelected && (
                                <motion.div 
                                    layoutId="command-highlight"
                                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent-400"
                                    style={{ backgroundColor: 'var(--accent-400)' }}
                                />
                            )}
                            <Icon size={18} className={`mr-3 ${cmd.group === 'Navigation' ? 'text-accent-400' : cmd.group === 'Actions' ? 'text-teal-400' : 'text-gray-400'}`} />
                            <span className="flex-1 text-[14px] text-white font-sans">{cmd.label}</span>
                            {cmd.kbd && (
                                <div className="flex items-center gap-1">
                                    {cmd.kbd.split(' ').map(k => (
                                        <span key={k} className="bg-gray-800 text-gray-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-700 font-mono">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
