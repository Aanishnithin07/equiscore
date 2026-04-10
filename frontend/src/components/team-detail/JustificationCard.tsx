import React from 'react';
import { Lock } from 'lucide-react';

interface Props {
  text: string;
}

export function JustificationCard({ text }: Props) {
  return (
    <div className="glass-card w-full mt-6 bg-white/[0.06]">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/[0.04] flex items-center shadow-sm">
        <Lock className="w-3.5 h-3.5 text-text-tertiary mr-2" />
        <h4 className="font-display text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
          Audit Trail — Rubric Justification
        </h4>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <p className="font-body text-[14px] leading-[1.7] text-text-primary/90 text-justify">
          {text}
        </p>
      </div>
    </div>
  );
}
