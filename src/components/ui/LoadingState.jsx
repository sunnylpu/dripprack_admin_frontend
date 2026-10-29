import React from 'react';

/**
 * Tactical Terminal Loading State Component
 */
export function LoadingState({ message = 'INITIALIZING SYSTEM KERNEL...' }) {
  return (
    <div className="min-h-screen w-full bg-surface flex flex-col items-center justify-center p-space-md select-none">
      <div className="relative flex items-center justify-center mb-space-md">
        <div className="w-16 h-16 rounded-full border border-primary/20 animate-ping absolute"></div>
        <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-secondary absolute"></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">
          DRIPRACK // SYS.AUTH
        </span>
        <span className="font-mono text-xs text-on-surface-variant animate-pulse">
          {message}
        </span>
      </div>
    </div>
  );
}

