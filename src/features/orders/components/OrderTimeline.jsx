import React from 'react';
import { formatDateTime, formatRelativeTime } from '../../../lib/formatters.js';
import {
  FileText,
  User,
  ShieldCheck,
  Clock,
  ArrowRight
} from 'lucide-react';

export function OrderTimeline({ auditLogs = [] }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center text-outline font-mono text-xs">
        No administrative audit events recorded for this order yet.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 divide-y divide-outline-variant/20">
      {auditLogs.map((log) => {
        const actorName = log.actor
          ? `${log.actor.firstName || ''} ${log.actor.lastName || ''}`.trim() || log.actor.email
          : 'System / Admin';

        return (
          <div key={log._id || log.createdAt} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-on-surface">
                  {log.action}
                </span>
                <span className="font-mono text-[11px] text-outline">
                  {formatDateTime(log.createdAt)} ({formatRelativeTime(log.createdAt)})
                </span>
              </div>

              {/* Actor & IP */}
              <div className="flex items-center gap-2 text-outline font-mono text-[11px]">
                <User className="w-3 h-3" />
                <span>{actorName}</span>
                {log.ipAddress && (
                  <>
                    <span>&bull;</span>
                    <span>IP: {log.ipAddress}</span>
                  </>
                )}
              </div>

              {/* Log Details */}
              {log.details && typeof log.details === 'object' && Object.keys(log.details).length > 0 && (
                <div className="p-2 rounded bg-surface-container font-mono text-[11px] text-on-surface-variant space-y-0.5">
                  {log.details.previousStatus && log.details.newStatus && (
                    <div className="flex items-center gap-1.5">
                      <span>Status transition:</span>
                      <span className="text-outline">{log.details.previousStatus}</span>
                      <ArrowRight className="w-3 h-3 text-primary" />
                      <span className="text-primary font-bold">{log.details.newStatus}</span>
                    </div>
                  )}
                  {log.details.tracking && (
                    <div>
                      Carrier: {log.details.tracking.carrier} | Tracking #:{' '}
                      {log.details.tracking.trackingNumber}
                    </div>
                  )}
                  {log.details.reason && (
                    <div>Reason: {log.details.reason}</div>
                  )}
                  {log.details.codPaymentCollected && (
                    <div className="text-secondary font-bold">COD payment collected at delivery</div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
