import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../../lib/apiClient.js';
import { useAuth } from '../../app/providers/AuthProvider.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { DashboardSkeleton } from './components/DashboardSkeleton.jsx';
import { KpiRibbon } from './components/KpiRibbon.jsx';
import { OrderPipelineDistribution } from './components/OrderPipelineDistribution.jsx';
import { RecentOrdersTable } from './components/RecentOrdersTable.jsx';
import { formatDateTime, formatRelativeTime } from '../../lib/formatters.js';
import { RefreshCw, Activity, AlertCircle, Info, Database } from 'lucide-react';

export function DashboardView() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  /**
   * Fetch live summary metrics from the backend endpoint: GET /api/v1/admin/dashboard/summary
   */
  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await apiClient.get('/admin/dashboard/summary');

      // Verify payload structure matches backend contract
      if (!data || typeof data !== 'object') {
        throw new Error('Received malformed response payload from dashboard summary endpoint');
      }

      if (!data.revenue || !data.ordersByStatus || typeof data.totalOrdersCount !== 'number') {
        throw new Error('Dashboard summary payload is missing required schema fields');
      }

      if (isMountedRef.current) {
        setSummary(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadDashboardData(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [loadDashboardData]);

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <PageHeader
        title="Executive Control Center"
        subtitle={`Operational telemetry for authenticated administrator ${user?.firstName || 'Operator'} (${user?.email || 'admin'})`}
        badge="OPERATIONAL OVERVIEW"
        actions={
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-mono text-on-surface transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        }
      />

      {/* API Ingestion & Data Provenance Banner */}
      <div className="w-full bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-surface-container-high rounded text-secondary font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>API: /admin/dashboard/summary</span>
          </div>

          <div className="h-3 w-px bg-outline-variant/30 hidden sm:block" />

          <span className="font-mono text-xs text-outline flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="text-on-surface">MONGODB AGGREGATION</span>
            <span>•</span>
            <span>INTEGER-CENTS STRICT</span>
          </span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono text-outline">
          {summary?.generatedAt && (
            <span>
              Generated: <span className="text-on-surface">{formatDateTime(summary.generatedAt)}</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing || isLoading}
            className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
            title="Refresh metrics"
            aria-label="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Rendering: Loading / Error / Success */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : error && !summary ? (
        <ErrorState
          title="Dashboard Ingestion Error"
          message={error.message || 'Failed to retrieve executive dashboard summary from administrative API.'}
          code={error.code}
          onRetry={() => loadDashboardData(false)}
        />
      ) : summary ? (
        <div className="space-y-6">
          {/* Non-destructive Refresh Error Alert (if refreshing failed but existing data is retained) */}
          {error && (
            <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 flex items-center justify-between text-xs font-mono text-error">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Failed to refresh latest metrics. Retaining last successful ingest.</span>
              </div>
              <button
                type="button"
                onClick={() => loadDashboardData(true)}
                className="underline hover:no-underline font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {/* 4 Executive KPI Cards */}
          <KpiRibbon summary={summary} />

          {/* Order Status Distribution & Quick Actions */}
          <OrderPipelineDistribution
            ordersByStatus={summary.ordersByStatus}
            totalOrdersCount={summary.totalOrdersCount}
          />

          {/* Recent Orders Data Table */}
          <RecentOrdersTable
            recentOrders={summary.recentOrders}
            defaultCurrency={summary.revenue?.currency}
          />

          {/* Backend Caveat Footnote Banner */}
          <div className="p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-start gap-3 text-xs font-body text-outline">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-mono text-xs text-on-surface font-semibold block uppercase">
                Backend Data Semantics Note
              </span>
              <p className="leading-relaxed">
                Recognized Revenue is calculated by the backend by matching orders with <code>paymentStatus: 'paid'</code>. Per verified backend implementation in <code>admin.service.js</code>, cancelled orders with paid status are currently included in revenue aggregation until backend filter refinement is scheduled. The frontend renders authoritative backend figures without fabricating client-side recalculations.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
