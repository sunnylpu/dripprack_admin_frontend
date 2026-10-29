import React from 'react';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { formatDateTime, formatRelativeTime } from '../../../lib/formatters.js';
import {
  FileText,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  ShoppingBag,
  SlidersHorizontal,
  X
} from 'lucide-react';

const MOVEMENT_TYPES = [
  { value: 'all', label: 'All Movements' },
  { value: 'adjustment', label: 'Adjustment', icon: SlidersHorizontal },
  { value: 'reservation', label: 'Reservation', icon: Lock },
  { value: 'release', label: 'Release', icon: Unlock },
  { value: 'sale', label: 'Sale', icon: ShoppingBag },
  { value: 'restock', label: 'Restock', icon: ArrowDownRight }
];

export function MovementHistoryTable({
  movements = [],
  meta,
  isLoading = false,
  isRefreshing = false,
  onPageChange,
  onRefresh,
  selectedType,
  setSelectedType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedSort,
  setSelectedSort,
  dateError
}) {
  const getMovementBadge = (type) => {
    switch (type) {
      case 'adjustment':
        return {
          label: 'ADJUSTMENT',
          className: 'bg-primary/20 text-primary border-primary/30',
          icon: SlidersHorizontal
        };
      case 'reservation':
        return {
          label: 'RESERVATION',
          className: 'bg-tertiary/20 text-tertiary border-tertiary/30',
          icon: Lock
        };
      case 'release':
        return {
          label: 'RELEASE',
          className: 'bg-secondary/20 text-secondary border-secondary/30',
          icon: Unlock
        };
      case 'sale':
        return {
          label: 'SALE',
          className: 'bg-surface-container text-outline border-outline-variant/30',
          icon: ShoppingBag
        };
      case 'restock':
        return {
          label: 'RESTOCK',
          className: 'bg-secondary/20 text-secondary border-secondary/30',
          icon: ArrowDownRight
        };
      default:
        return {
          label: (type || 'UNKNOWN').toUpperCase(),
          className: 'bg-surface-container text-outline',
          icon: FileText
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Immutable Notice Banner */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface-container text-secondary">
            <ShieldCheck className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide">
                Immutable Inventory Movement Ledger
              </h3>
              <span className="font-mono text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/30 font-bold">
                APPEND-ONLY
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              Cryptographically timestamped transaction log. Records cannot be edited, deleted, or backdated.
            </p>
          </div>
        </div>
        <div className="font-mono text-xs text-outline">
          {meta?.total !== undefined ? `${meta.total} MOVEMENTS RECORDED` : ''}
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-surface-container-lowest p-4 rounded-xl space-y-3 border border-outline-variant/30 shadow-sm">
        {/* Movement Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-xs text-outline uppercase mr-1">TYPE:</span>
          {MOVEMENT_TYPES.map((type) => {
            const isSelected = selectedType === type.value;
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all border ${
                  isSelected
                    ? 'bg-primary-container text-on-primary-container border-primary/50 font-bold shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border-outline-variant/30'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Range and Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-outline-variant/20">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/30">
              <Calendar className="w-3.5 h-3.5 text-outline" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-mono text-xs text-on-surface focus:outline-none"
                title="Start Date"
              />
              <span className="text-outline text-xs">&rarr;</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-mono text-xs text-on-surface focus:outline-none"
                title="End Date"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-outline hover:text-on-surface ml-1"
                  title="Clear dates"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {dateError && (
              <span className="font-mono text-xs text-error">{dateError}</span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-surface-container font-mono text-xs text-on-surface px-3 py-1.5 rounded-lg appearance-none pr-8 border border-outline-variant/30 focus:outline-none cursor-pointer"
              >
                <option value="createdAt:desc">Sort: Newest First</option>
                <option value="createdAt:asc">Sort: Oldest First</option>
              </select>
              <Sliders className="w-3.5 h-3.5 text-outline absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading || isRefreshing}
              className="p-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg transition-colors border border-outline-variant/30 disabled:opacity-50"
              title="Refresh movement log"
            >
              <RefreshCw
                className={`w-4 h-4 text-outline ${isRefreshing ? 'animate-spin text-primary' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Movement Log Stream */}
      <div className="bg-surface-container-lowest rounded-xl divide-y divide-outline-variant/20 overflow-hidden border border-outline-variant/30 shadow-sm">
        {isLoading && movements.length === 0 ? (
          <div className="py-16 text-center text-outline font-mono text-xs">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span>Loading movement audit records...</span>
            </div>
          </div>
        ) : movements.length === 0 ? (
          <div className="py-16 text-center text-outline">
            <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
              <Layers className="w-10 h-10 text-outline-variant" />
              <span className="font-headline font-semibold text-base text-on-surface">
                No Movement Records Found
              </span>
              <p className="text-xs text-outline">
                No stock movements have occurred matching the selected movement type or date range filter.
              </p>
            </div>
          </div>
        ) : (
          movements.map((entry) => {
            const delta = entry.quantityDelta ?? 0;
            const isPositive = delta > 0;
            const isZero = delta === 0;
            const badge = getMovementBadge(entry.movementType);
            const BadgeIcon = badge.icon;

            const actorName = entry.actor
              ? `${entry.actor.firstName || ''} ${entry.actor.lastName || ''}`.trim() || entry.actor.email
              : entry.actorRole || 'System';

            return (
              <div
                key={entry._id}
                className="p-4 hover:bg-surface-container-low/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left section: Delta pill & Details */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Delta indicator box */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono text-sm font-bold flex-shrink-0 ${
                      isPositive
                        ? 'bg-secondary/15 text-secondary border border-secondary/30'
                        : isZero
                        ? 'bg-surface-container text-outline'
                        : 'bg-error-container/40 text-on-error-container border border-error/30'
                    }`}
                  >
                    {isPositive ? `+${delta}` : delta}
                  </div>

                  {/* Movement Information */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border font-bold ${badge.className}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      <span className="font-headline font-semibold text-sm text-on-surface">
                        {entry.product?.name || 'Product'}
                      </span>
                      <span className="font-mono text-xs text-primary font-semibold">
                        {entry.sku || entry.product?.sku}
                      </span>
                      {entry.orderReference && (
                        <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                          REF: {entry.orderReference}
                        </span>
                      )}
                    </div>

                    {/* Audit Reason Note */}
                    <p className="font-mono text-xs text-on-surface-variant break-words">
                      {entry.reason || 'Operational ledger adjustment'}
                    </p>

                    {/* Sub-meta: Transaction ID, Timestamp, Idempotency */}
                    <div className="font-mono text-[11px] text-outline flex items-center gap-3 pt-0.5 flex-wrap">
                      <span>ID: {entry._id.slice(-8)}</span>
                      <span>&bull;</span>
                      <span>{formatDateTime(entry.createdAt)}</span>
                      <span className="text-outline-variant">({formatRelativeTime(entry.createdAt)})</span>
                      {entry.idempotencyKey && (
                        <>
                          <span>&bull;</span>
                          <span
                            className="text-outline-variant"
                            title={`Idempotency Key: ${entry.idempotencyKey}`}
                          >
                            KEY: {entry.idempotencyKey.slice(0, 8)}...
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right section: Stock transition & Actor */}
                <div className="flex items-center gap-4 self-end md:self-center flex-shrink-0">
                  <div className="text-right font-mono text-xs">
                    <div className="text-[10px] text-outline uppercase">Physical Transition</div>
                    <div className="text-on-surface font-medium">
                      {entry.previousPhysical ?? '—'} &rarr;{' '}
                      <span
                        className={`font-bold ${
                          isPositive ? 'text-secondary' : delta < 0 ? 'text-error' : 'text-on-surface'
                        }`}
                      >
                        {entry.newPhysical ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="text-[10px] text-outline uppercase">Available Transition</div>
                    <div className="text-on-surface font-medium">
                      {entry.previousAvailable ?? '—'} &rarr;{' '}
                      <span
                        className={`font-bold ${
                          isPositive ? 'text-secondary' : delta < 0 ? 'text-error' : 'text-on-surface'
                        }`}
                      >
                        {entry.newAvailable ?? '—'}
                      </span>
                    </div>
                  </div>

                  {/* Actor Badge */}
                  <span className="font-mono text-xs bg-surface-container text-on-surface-variant px-2.5 py-1 rounded border border-outline-variant/30">
                    {actorName} ({entry.actorRole || 'actor'})
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Server Pagination */}
        {meta && (
          <div className="border-t border-outline-variant/30">
            <Pagination meta={meta} onPageChange={onPageChange} />
          </div>
        )}
      </div>
    </div>
  );
}
