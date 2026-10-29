import React from 'react';

export function PageHeader({ title, subtitle, badge, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30 mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
            {title}
          </h1>
          {badge && (
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-primary">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm font-body text-outline mt-1 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

