import React from 'react';
import { formatDateTime, formatRelativeTime } from '../../../lib/formatters.js';
import { structureMixedDetails } from '../auditLogValidation.js';
import {
  X,
  ShieldCheck,
  User,
  Clock,
  Terminal,
  Server,
  Layers,
  Hash,
  Copy,
  Check
} from 'lucide-react';

function RenderDetailsNode({ node, depth = 0 }) {
  if (!node) return null;

  if (node.isObject && Array.isArray(node.children)) {
    return (
      <div className={`space-y-1 ${depth > 0 ? 'pl-3 border-l border-outline-variant/30 mt-1' : ''}`}>
        <span className="font-mono text-[11px] text-primary font-bold">{node.key}:</span>
        <div className="space-y-1">
          {node.children.map((child, idx) => (
            <RenderDetailsNode key={`${child.key}-${idx}`} node={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 font-mono text-xs py-1 border-b border-outline-variant/10 last:border-b-0">
      <span className="text-outline flex-shrink-0 font-medium">{node.key}:</span>
      <span className="text-on-surface text-right break-all">{node.value}</span>
    </div>
  );
}

export function AuditLogDetailsDrawer({
  isOpen,
  onClose,
  log
}) {
  const [copiedId, setCopiedId] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !log) return null;

  const actorName = log.actor
    ? `${log.actor.firstName || ''} ${log.actor.lastName || ''}`.trim() ||
      log.actor.email ||
      'Admin'
    : 'System / Unattributed';

  const actorEmail = log.actor?.email || '—';
  const actorRole = log.actor?.role || 'actor';
  const actorId = log.actor?._id || log.actor || '—';

  const structuredDetails = structureMixedDetails(log.details);
  const rawDetailsJson = log.details ? JSON.stringify(log.details, null, 2) : '{}';

  const handleCopyId = (text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-drawer-title"
        className="fixed inset-y-0 right-0 w-full max-w-xl bg-surface-container-low shadow-2xl z-50 flex flex-col border-l border-outline-variant/30"
      >
        {/* Header */}
        <div className="p-6 bg-surface-container-lowest flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 id="audit-drawer-title" className="font-mono text-base font-bold text-on-surface uppercase tracking-wide">
                Audit Event Dossier
              </h2>
            </div>
            <span className="font-mono text-[11px] text-outline mt-1">
              IMMUTABLE TRANSACTION RECORD
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Close Drawer"
            aria-label="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Action Header Card */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20">
              {log.action}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-xs text-outline">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDateTime(log.createdAt)}</span>
              <span className="text-outline-variant">({formatRelativeTime(log.createdAt)})</span>
            </div>
          </div>

          {/* Event ID with copy */}
          <div className="flex items-center justify-between gap-2 font-mono text-xs bg-surface-container p-2.5 rounded-lg border border-outline-variant/20">
            <div className="flex items-center gap-1.5 min-w-0">
              <Hash className="w-3.5 h-3.5 text-outline flex-shrink-0" />
              <span className="text-outline text-[11px]">EVENT ID:</span>
              <span className="text-on-surface font-semibold truncate">{log._id}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyId(log._id)}
              className="p-1 text-outline hover:text-on-surface"
              title="Copy Event ID"
            >
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-secondary" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Resource Target Dossier */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-outline uppercase font-semibold">
            <span>Resource Target</span>
            <Server className="w-4 h-4 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-surface-container-lowest p-2.5 rounded">
              <span className="text-outline text-[10px] block">RESOURCE TYPE</span>
              <span className="font-bold text-on-surface uppercase">{log.resourceType}</span>
            </div>
            <div className="bg-surface-container-lowest p-2.5 rounded">
              <span className="text-outline text-[10px] block">RESOURCE IDENTIFIER</span>
              <span className="font-bold text-primary">{log.resourceId}</span>
            </div>
          </div>
        </div>

        {/* Actor Identity Dossier */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-outline uppercase font-semibold">
            <span>Actor Identity</span>
            <User className="w-4 h-4 text-tertiary" />
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between border-b border-outline-variant/20 pb-1.5">
              <span className="text-outline">Actor Name:</span>
              <span className="font-semibold text-on-surface">{actorName}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/20 pb-1.5">
              <span className="text-outline">Email Address:</span>
              <span className="text-on-surface">{actorEmail}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/20 pb-1.5">
              <span className="text-outline">Role Authority:</span>
              <span className="text-primary font-bold uppercase">{actorRole}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/20 pb-1.5">
              <span className="text-outline">Actor User ID:</span>
              <span className="text-outline font-mono text-[11px]">{actorId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Client IP Address:</span>
              <span className="text-on-surface">{log.ipAddress || '—'}</span>
            </div>
          </div>
        </div>

        {/* Mixed Details Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-outline uppercase font-semibold">
            <span>Event Context &amp; Details (Mixed)</span>
            <Terminal className="w-4 h-4 text-outline" />
          </div>

          {structuredDetails.length === 0 ? (
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center text-outline font-mono text-xs">
              No additional mutation payload recorded for this event.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Structured Key/Value Presentation */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-1">
                {structuredDetails.map((node, idx) => (
                  <RenderDetailsNode key={`${node.key}-${idx}`} node={node} />
                ))}
              </div>

              {/* Raw JSON View */}
              <details className="bg-surface-container rounded-xl p-3 border border-outline-variant/20 font-mono text-xs">
                <summary className="text-outline hover:text-on-surface cursor-pointer select-none">
                  Inspect Raw Serialized JSON
                </summary>
                <pre className="mt-2 p-3 bg-surface-container-lowest rounded overflow-x-auto text-[11px] text-on-surface leading-relaxed border border-outline-variant/20">
                  {rawDetailsJson}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}

