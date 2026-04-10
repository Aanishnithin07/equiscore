import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-12 h-full w-full">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-t-[3px] border-accent-primary rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-[3px] border-accent-secondary rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
      </div>
      <p className="mt-4 font-mono text-sm text-text-secondary animate-pulse tracking-widest">
        LOADING TRACE...
      </p>
    </div>
  );
}
