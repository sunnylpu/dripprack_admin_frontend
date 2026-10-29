import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Layers, ArrowLeft, Terminal, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PhasePlaceholderView({
  title,
  phase,
  description,
  plannedCapabilities = [],
  backendEndpoints = []
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={description}
        badge={phase}
      />

      <div className="p-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-center max-w-3xl mx-auto my-8">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary mx-auto mb-4 border border-outline-variant/40">
          <Layers className="w-7 h-7" />
        </div>

        <span className="font-mono text-xs text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20 uppercase tracking-widest inline-block mb-3">
          {phase} Implementation Target
        </span>

        <h2 className="text-xl font-headline font-bold text-on-surface mb-2">
          {title} Module Not Yet Implemented
        </h2>

        <p className="text-sm font-body text-outline max-w-lg mx-auto mb-6 leading-relaxed">
          Per Phase 1 engineering specifications, business operational screens are quarantined to prevent deployment of fabricated metrics or mock states.
        </p>

        {plannedCapabilities.length > 0 && (
          <div className="text-left bg-surface-container-low p-5 rounded-lg border border-outline-variant/30 mb-6">
            <h4 className="font-mono text-xs text-on-surface uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Planned Functional Capabilities
            </h4>
            <ul className="space-y-2">
              {plannedCapabilities.map((cap, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-outline font-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant mt-1.5 shrink-0" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {backendEndpoints.length > 0 && (
          <div className="text-left bg-surface-container-low p-5 rounded-lg border border-outline-variant/30 mb-6">
            <h4 className="font-mono text-xs text-on-surface uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-secondary" />
              Associated Backend Endpoints Ready For Integration
            </h4>
            <div className="space-y-1.5">
              {backendEndpoints.map((ep, idx) => (
                <div key={idx} className="font-mono text-xs bg-surface-container px-3 py-1.5 rounded border border-outline-variant/20 flex items-center justify-between">
                  <span className="text-on-surface-variant">{ep.route}</span>
                  <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase font-bold">
                    {ep.method}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono text-outline hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Admin Control Center
        </Link>
      </div>
    </div>
  );
}

