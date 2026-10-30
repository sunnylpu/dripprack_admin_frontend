import React from 'react';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { formatDateTime, formatRelativeTime } from '../../../lib/formatters.js';
import {
  FileText,
  ShieldCheck,
  Eye,
  RefreshCw,
  Terminal,
  User,
  ArrowRight
} from 'lucide-react';

export function AuditLogTable({
  auditLogs = [],
  meta,
  isLoading = false,
  isRefreshing = false,
  onPageChange,
  onInspectLog,
  onRefresh
}) {
  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'ORDER_STATUS_CHANGED':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'ORDER_CANCELLED':
        return 'bg-error-container text-on-error-container border border-error/30 font-bold';
      case 'COD_PAYMENT_COLLECTED':
        return 'bg-secondary-container text-on-secondary-container border border-secondary/30 font-bold';
      default:
        return 'bg-surface-container text-on-surface-variant border border-outline-variant/30';
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm space-y-0">
      {/* Header Strip */}
      <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-wider text-outline font-medium">
            {meta?.total !== undefined
              ? `${meta.total} Immutable Audit Records`
              : 'Audit Event Stream'}
          </span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-outline-variant/30 disabled:opacity-50"
          title="Refresh audit log"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-outline ${isRefreshing ? 'animate-spin text-primary' : ''}`}
          />
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/60 text-outline uppercase font-mono text-[11px] tracking-wider border-b border-outline-variant/30">
              <th className="py-3 px-4">TIMESTAMP (UTC)</th>
              <th className="py-3 px-4">ACTOR &amp; IDENTITY</th>
              <th className="py-3 px-4">ACTION</th>
              <th className="py-3 px-4">RESOURCE TARGET</th>
              <th className="py-3 px-4">CLIENT IP</th>
              <th className="py-3 px-4 text-right">DETAILS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-body text-sm text-on-surface">
            {isLoading && auditLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-outline font-mono text-xs">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <span>Loading administrative audit records...</span>
                  </div>
                </td>
              </tr>
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-outline">
                  <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                    <ShieldCheck className="w-10 h-10 text-outline-variant" />
                    <span className="font-headline font-semibold text-base text-on-surface">
                      No Audit Records Found
                    </span>
                    <p className="text-xs text-outline font-mono">
                      No administrative operations match the current filter criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => {
                const actorName = log.actor
                  ? `${log.actor.firstName || ''} ${log.actor.lastName || ''}`.trim() ||
                    log.actor.email ||
                    'Admin'
                  : 'System / Unattributed';

                const actorRole = log.actor?.role || 'actor';

                return (
                  <tr
                    key={log._id}
                    onClick={() => onInspectLog(log)}
                    className="hover:bg-surface-container/60 transition-colors cursor-pointer group"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col font-mono">
                        <span className="text-xs font-medium text-on-surface">
                          {formatDateTime(log.createdAt)}
                        </span>
                        <span className="text-[11px] text-outline">
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono">
                        <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-primary text-[10px] font-bold">
                          <User className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-on-surface">
                            {actorName}
                          </span>
                          {log.actor?.email && (
                            <span className="text-[11px] text-outline">
                              {log.actor.email}
                            </span>
                          )}
                        </div>
                        <span className="bg-surface-container text-outline px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ml-1 border border-outline-variant/30">
                          {actorRole}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-mono text-[11px] px-2.5 py-1 rounded font-semibold tracking-wide ${getActionBadgeClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Resource Target */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-outline uppercase text-[11px]">
                          {log.resourceType}:
                        </span>
                        <span className="text-primary font-bold">
                          {log.resourceId}
                        </span>
                      </div>
                    </td>

                    {/* Client IP */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-outline">
                      {log.ipAddress || '—'}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onInspectLog(log)}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary hover:text-on-surface font-mono text-xs font-semibold transition-colors border border-outline-variant/30 inline-flex items-center gap-1"
                        title="Inspect event details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Server-Side Pagination */}
      {meta && (
        <div className="border-t border-outline-variant/30">
          <Pagination meta={meta} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}

