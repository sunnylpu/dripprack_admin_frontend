import React from 'react';
import { formatDateTime, formatRelativeTime } from '../../../lib/formatters.js';
import {
  ShieldCheck,
  User,
  ArrowRight,
  Terminal,
  Eye,
  Layers
} from 'lucide-react';

export function AuditLogTimeline({
  auditLogs = [],
  onInspectLog
}) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center text-outline font-mono text-xs">
        No administrative audit events recorded in this page view.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2 font-mono text-xs text-outline">
          <Layers className="w-4 h-4 text-primary" />
          <span className="uppercase font-semibold tracking-wider">
            Paginated Timeline View (Newest-First)
          </span>
        </div>
        <span className="font-mono text-[11px] text-outline">
          Showing {auditLogs.length} events from active page
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/30">
        {auditLogs.map((log) => {
          const actorName = log.actor
            ? `${log.actor.firstName || ''} ${log.actor.lastName || ''}`.trim() ||
              log.actor.email ||
              'Admin'
            : 'System';

          return (
            <div key={log._id} className="relative group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-container border-2 border-primary flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>

              {/* Event Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onInspectLog(log)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onInspectLog(log);
                  }
                }}
                aria-label={`Inspect audit record: ${log.action} on ${log.resourceType} ${log.resourceId}`}
                className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
                      {log.action}
                    </span>
                    <span className="font-mono text-xs text-on-surface">
                      Target: <strong className="text-primary">{log.resourceType}:{log.resourceId}</strong>
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-outline">
                    {formatDateTime(log.createdAt)} ({formatRelativeTime(log.createdAt)})
                  </span>
                </div>

                {/* Actor & Client IP */}
                <div className="flex items-center gap-3 font-mono text-xs text-outline flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-on-surface-variant font-medium">{actorName}</span>
                    {log.actor?.role && (
                      <span className="text-[10px] bg-surface-container px-1.5 py-0.2 rounded uppercase">
                        {log.actor.role}
                      </span>
                    )}
                  </div>
                  {log.ipAddress && (
                    <>
                      <span>&bull;</span>
                      <span>Client IP: {log.ipAddress}</span>
                    </>
                  )}
                </div>

                {/* Details Preview if present */}
                {log.details && typeof log.details === 'object' && Object.keys(log.details).length > 0 && (
                  <div className="p-2.5 rounded bg-surface-container-lowest font-mono text-[11px] text-on-surface-variant space-y-1 border border-outline-variant/10">
                    {log.details.previousStatus && log.details.newStatus && (
                      <div className="flex items-center gap-1.5">
                        <span>Fulfillment transition:</span>
                        <span className="text-outline">{log.details.previousStatus}</span>
                        <ArrowRight className="w-3 h-3 text-primary" />
                        <span className="text-primary font-bold">{log.details.newStatus}</span>
                      </div>
                    )}
                    {log.details.reason && (
                      <div>Reason note: &quot;{log.details.reason}&quot;</div>
                    )}
                    {log.details.codPaymentCollected && (
                      <div className="text-secondary font-bold">
                        COD Courier remittance confirmed collected
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

