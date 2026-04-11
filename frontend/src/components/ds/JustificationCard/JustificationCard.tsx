// frontend/src/components/ds/JustificationCard/JustificationCard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Badge } from '../Badge/Badge';
import { Card } from '../Card/Card';

interface Props {
  text: string;
}

export const JustificationCard: React.FC<Props> = ({ text }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Reveal text shortly after mount mimicking AI streaming contextually
    const t = setTimeout(() => setIsRevealed(true), 150);
    return () => clearTimeout(t);
  }, [text]);

  const dropCap = text.charAt(0);
  const remaining = text.substring(1);

  return (
    <Card glass="glass-2" className="w-full mt-8" accentBar="top">
      <div className="mesh-card" />
      
      <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-ghost)] relative z-10">
        <div className="flex items-center gap-2">
          <span className="microlabel text-[var(--text-tertiary)] tracking-widest leading-none">AUDIT TRAIL</span>
          <Lock size={10} className="text-[var(--text-tertiary)] mb-[1px]" />
        </div>
        <Badge variant="neutral" size="sm" className="bg-transparent opacity-60 hover:opacity-100 transition-opacity">
          IMMUTABLE RECORD
        </Badge>
      </div>

      <div className="px-6 pb-6 pt-5 relative z-10">
        <div 
          className="font-sans text-[15px] leading-[1.75] text-[var(--text-secondary)] relative"
          style={{ transition: 'clip-path 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease',
                   clipPath: isRevealed ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                   opacity: isRevealed ? 1 : 0
          }}
        >
          {/* Custom Drop Cap rendering natively within flow */}
          <span className="float-left text-[3.2em] font-['Sora'] font-bold text-white leading-[0.85] mr-3 mt-1 tracking-tighter">
            {dropCap}
          </span>
          {remaining}
        </div>
      </div>
    </Card>
  );
};
