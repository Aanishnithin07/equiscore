import React from 'react';
import { TrackEnum, EvaluationStatusEnum } from '../../types/evaluation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface BadgeProps {
  type: 'track' | 'status';
  value: TrackEnum | EvaluationStatusEnum;
  className?: string;
}

export function Badge({ type, value, className = '' }: BadgeProps) {
  if (type === 'track') {
    const trackColors: Record<TrackEnum, string> = {
      healthcare: 'bg-accent-secondary/15 text-accent-secondary border-accent-secondary/30',
      ai_ml: 'bg-accent-primary/15 text-accent-primary border-accent-primary/30',
      open_innovation: 'bg-accent-warning/15 text-accent-warning border-accent-warning/30',
    };
    
    const labels: Record<TrackEnum, string> = {
      healthcare: 'Healthcare',
      ai_ml: 'AI & ML',
      open_innovation: 'Open Innovation',
    };

    return (
      <span className={`inline-flex items-center px-2 py-[2px] rounded-full border text-xs font-mono font-medium ${trackColors[value as TrackEnum]} ${className}`}>
        {labels[value as TrackEnum]}
      </span>
    );
  }

  // Status Badge
  const statusConfig = {
    pending: { color: 'text-text-secondary bg-text-tertiary/20', icon: null, text: 'QUEUEING' },
    processing: { color: 'text-accent-warning bg-accent-warning/15 animate-pulse', icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />, text: 'PROCESSING' },
    completed: { color: 'text-accent-secondary bg-accent-secondary/15', icon: <CheckCircle2 className="w-3 h-3 mr-1" />, text: 'AI EVALUATED' },
    failed: { color: 'text-accent-danger bg-accent-danger/15', icon: <XCircle className="w-3 h-3 mr-1" />, text: 'FAILED' },
  };

  const config = statusConfig[value as EvaluationStatusEnum];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${config.color} ${className}`}>
      {config.icon}
      {config.text}
    </span>
  );
}
