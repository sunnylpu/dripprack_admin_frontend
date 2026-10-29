import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorState({
  title = 'Operation Error',
  message = 'An unexpected error occurred while communicating with the administrative API.',
  code,
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-surface-container-lowest border border-error/30 text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-error-container/20 border border-error/40 flex items-center justify-center text-error mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="font-headline font-bold text-lg text-on-surface mb-1">
        {title}
      </h3>

      {code && (
        <span className="font-mono text-xs text-error bg-error-container/20 px-2 py-0.5 rounded border border-error/30 mb-3">
          CODE: {code}
        </span>
      )}

      <p className="font-body text-sm text-outline mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Request
        </Button>
      )}
    </div>
  );
}

