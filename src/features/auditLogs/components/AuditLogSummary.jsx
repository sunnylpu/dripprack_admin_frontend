import React, { useMemo } from 'react';
import { formatNumber } from '../../../lib/formatters.js';
import {
  Database,
  Users,
  Layers,
  Activity,
  Info,
  ShieldCheck
} from 'lucide-react';

export function AuditLogSummary({
  auditLogs = [],
  meta,
  isLoading = false
}) {
  // Compute page-level aggregates strictly grounded in returned records
  const { uniqueActorsCount, uniqueActionsCount } = useMemo(() => {
    const actorIds = new Set();
    const actionTypes = new Set();

    auditLogs.forEach((log) => {
      const actorKey = log.actor?._id || log.actor || 'system';
      actorIds.add(actorKey);

      if (log.action) {
        actionTypes.add(log.action);
      }
    });

    return {
      uniqueActorsCount: actorIds.size,
      uniqueActionsCount: actionTypes.size
    };
  }, [auditLogs]);

  if (isLoading && auditLogs.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-container-low p-4 rounded-xl space-y-3 border border-outline-variant/30"
          >
            <div className="h-3 w-28 bg-surface-container rounded"></div>
            <div className="h-8 w-20 bg-surface-container rounded"></div>
            <div className="h-1.5 w-full bg-surface-container rounded-full"></div>
            <div className="h-3 w-32 bg-surface-container rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Informational Coverage Notice */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-3 shadow-sm">
        <div className="p-2 rounded-lg bg-surface-container text-primary flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-primary" />
        </div>
        <div className="space-y-0.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-surface uppercase">
              Administrative Audit Scope
            </span>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">
              ORDER OPERATIONS
            </span>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            The backend administrative audit trail records order fulfillment state mutations (
            <code className="text-primary font-bold">ORDER_STATUS_CHANGED</code>,{' '}
            <code className="text-primary font-bold">ORDER_CANCELLED</code>,{' '}
            <code className="text-secondary font-bold">COD_PAYMENT_COLLECTED</code>).
            Catalog management mutations, authentication attempts, and inventory adjustments (stored in the separate inventory movements ledger) are not recorded in this collection.
          </p>
        </div>
      </div>

      {/* Grounded Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Server Events */}
        <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-outline font-mono text-xs uppercase font-medium">
            <span>Total Matching Events</span>
            <Database className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-on-surface">
              {formatNumber(meta?.total ?? 0)}
            </span>
            <span className="font-mono text-xs text-outline">Server Total</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="text-xs text-outline font-mono">
            Authoritative query count across database
          </div>
        </div>

        {/* Card 2: Page Loaded Records */}
        <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-outline font-mono text-xs uppercase font-medium">
            <span>Page Loaded Records</span>
            <Layers className="w-4 h-4 text-secondary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-secondary">
              {formatNumber(auditLogs.length)}
            </span>
            <span className="font-mono text-xs text-outline">On Page</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="text-xs text-outline font-mono">
            Currently loaded page buffer
          </div>
        </div>

        {/* Card 3: Unique Actors on Page */}
        <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-outline font-mono text-xs uppercase font-medium">
            <span>Page Unique Actors</span>
            <Users className="w-4 h-4 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-tertiary">
              {formatNumber(uniqueActorsCount)}
            </span>
            <span className="font-mono text-xs text-outline">Distinct Actors</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-tertiary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="text-xs text-outline font-mono">
            Unique administrators on this page
          </div>
        </div>

        {/* Card 4: Distinct Actions on Page */}
        <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-outline font-mono text-xs uppercase font-medium">
            <span>Page Distinct Actions</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-primary">
              {formatNumber(uniqueActionsCount)}
            </span>
            <span className="font-mono text-xs text-outline">Action Types</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary-container h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="text-xs text-outline font-mono">
            Action types observed in current page
          </div>
        </div>
      </div>
    </div>
  );
}

