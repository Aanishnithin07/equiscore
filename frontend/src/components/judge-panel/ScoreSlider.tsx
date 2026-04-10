import React from 'react';

interface Props {
  value: number;
  onChange: (val: number) => void;
}

export function ScoreSlider({ value, onChange }: Props) {
  // Convert 0-100 score to 0-100 percentage for the background gradient
  const percentage = value;

  // The track gradient is specified as #FF6B6B to #FFB347 to #00D4AA
  return (
    <div className="relative w-full h-8 flex items-center mt-2 group">
      {/* Visual Track */}
      <div className="absolute w-full h-1.5 rounded-full bg-border-subtle overflow-hidden pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-accent-danger via-accent-warning to-accent-secondary"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Actual Range Input (Invisible but interactive) */}
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="absolute w-full h-full opacity-0 cursor-ew-resize m-0 p-0 z-10"
      />

      {/* Custom Thumb Element tied to value */}
      <div
        className="absolute h-[22px] w-[22px] rounded-full bg-accent-primary border-[2px] border-white shadow-[0_0_10px_rgba(124,111,247,0.5)] pointer-events-none transition-transform group-hover:scale-110 flex items-center justify-center"
        style={{ left: `calc(${percentage}% - 11px)` }}
      >
        <div className="w-1 h-2 flex justify-between space-x-[1px]">
           <div className="w-[1.5px] bg-white/50 h-full rounded-sm"></div>
           <div className="w-[1.5px] bg-white/50 h-full rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}
