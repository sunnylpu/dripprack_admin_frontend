import React, { useState, useEffect, useCallback, useRef } from 'react';
import { auditLogApi } from './auditLogApi.js';
import {
  validateActorId,
  validateAuditDateRange,
  validateAuditFilterString
} from './auditLogValidation.js';
import { AuditLogSummary } from './components/AuditLogSummary.jsx';
import { AuditLogFilters } from './components/AuditLogFilters.jsx';
import { AuditLogTable } from './components/AuditLogTable.jsx';
import { AuditLogTimeline } from './components/AuditLogTimeline.jsx';
import { AuditLogDetailsDrawer } from './components/AuditLogDetailsDrawer.jsx';
import {
  ShieldCheck,
  Terminal,
  Table as TableIcon,
  Layers,
  XCircle,
  X,
  RefreshCw
} from 'lucide-react';

export function AuditLogsView() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // View presentation mode: 'table' | 'timeline'
  const [viewMode, setViewMode] = useState('table');

  // Filters state
  const [action, setAction] = useState('ALL');
  const [resourceType, setResourceType] = useState('ALL');
  const [resourceId, setResourceId] = useState('');
  const [actor, setActor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Validation error states
  const [dateError, setDateError] = useState('');
  const [actorError, setActorError] = useState('');

  // Drawer state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetch paginated audit log entries from backend
   */
  const loadAuditLogs = useCallback(
    async (targetPage = 1, isManual = false) => {
      // 1. Validate actor if provided
      const actorCheck = validateActorId(actor);
      if (!actorCheck.isValid) {
        setActorError(actorCheck.error || 'Invalid actor ID');
        return;
      }
      setActorError('');

      // 2. Validate date range if provided
      if (startDate && endDate) {
        const dateCheck = validateAuditDateRange({ startDate, endDate });
        if (!dateCheck.isValid) {
          setDateError(dateCheck.error || 'Invalid date range');
          return;
        }
      }
      setDateError('');

      if (isManual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setGeneralError(null);

      try {
        const startIso = startDate ? new Date(startDate).toISOString() : undefined;
        const endIso = endDate ? new Date(`${endDate}T23:59:59.999Z`).toISOString() : undefined;

        const res = await auditLogApi.getAdminAuditLogs({
          page: targetPage,
          limit: 20,
          actor: actorCheck.parsedActor,
          action: action !== 'ALL' ? action.trim() : undefined,
          resourceType: resourceType !== 'ALL' ? resourceType.trim() : undefined,
          resourceId: resourceId.trim() || undefined,
          startDate: startIso,
          endDate: endIso
        });

        if (isMountedRef.current) {
          setAuditLogs(res?.auditLogs || []);
          setMeta(res?.meta || null);
          setPage(targetPage);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setGeneralError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [actor, action, resourceType, resourceId, startDate, endDate]
  );

  // Debounce filters
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAuditLogs(1, false);
    }, 250);
    return () => clearTimeout(timer);
  }, [loadAuditLogs]);

  /**
   * Reset all filters to default
   */
  const handleResetFilters = () => {
    setAction('ALL');
    setResourceType('ALL');
    setResourceId('');
    setActor('');
    setStartDate('');
    setEndDate('');
    setDateError('');
    setActorError('');
  };

  /**
   * Open details drawer for an audit record
   */
  const handleInspectLog = (log) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedLog(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-on-primary font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              SECURITY // SYSTEM AUDIT LOG
            </span>
            <span className="font-mono text-xs text-outline">
              IMMUTABLE ADMINISTRATIVE LEDGER
            </span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-on-surface uppercase tracking-tight">
            Security &amp; System Audit Trail
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Administrative activity records, actor identity, resource references, and event details.
          </p>
        </div>

        {/* View Presentation Mode Toggle */}
        <div className="inline-flex p-1 bg-surface-container-lowest rounded-xl border border-outline-variant/30 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
              viewMode === 'timeline'
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Timeline View</span>
          </button>
        </div>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 flex items-center justify-between text-xs font-mono text-error">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError.message || 'An error occurred while loading audit logs.'}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeneralError(null)}
            className="text-error hover:opacity-80 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grounded Summary Cards & Coverage Banner */}
      <AuditLogSummary
        auditLogs={auditLogs}
        meta={meta}
        isLoading={isLoading}
      />

      {/* Filters Deck */}
      <AuditLogFilters
        action={action}
        setAction={setAction}
        resourceType={resourceType}
        setResourceType={setResourceType}
        resourceId={resourceId}
        setResourceId={setResourceId}
        actor={actor}
        setActor={setActor}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onResetFilters={handleResetFilters}
        dateError={dateError}
        actorError={actorError}
      />

      {/* Table vs Timeline View */}
      {viewMode === 'table' ? (
        <AuditLogTable
          auditLogs={auditLogs}
          meta={meta}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onPageChange={(p) => loadAuditLogs(p, false)}
          onInspectLog={handleInspectLog}
          onRefresh={() => loadAuditLogs(page, true)}
        />
      ) : (
        <AuditLogTimeline
          auditLogs={auditLogs}
          onInspectLog={handleInspectLog}
        />
      )}

      {/* Event Details Drawer */}
      <AuditLogDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        log={selectedLog}
      />
    </div>
  );
}

