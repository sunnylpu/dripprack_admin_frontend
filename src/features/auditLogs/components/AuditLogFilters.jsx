import React from 'react';
import {
  Filter,
  Calendar,
  User,
  Tag,
  Hash,
  X,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { validateActorId } from '../auditLogValidation.js';

const COMMON_ACTIONS = [
  'ALL',
  'ORDER_STATUS_CHANGED',
  'ORDER_CANCELLED',
  'COD_PAYMENT_COLLECTED'
];

const COMMON_RESOURCES = ['ALL', 'order'];

export function AuditLogFilters({
  action,
  setAction,
  resourceType,
  setResourceType,
  resourceId,
  setResourceId,
  actor,
  setActor,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onResetFilters,
  dateError,
  actorError
}) {
  const hasActiveFilters =
    action !== 'ALL' ||
    resourceType !== 'ALL' ||
    resourceId ||
    actor ||
    startDate ||
    endDate;

  return (
    <div className="bg-surface-container-low p-4 rounded-xl shadow-sm flex flex-col gap-4 border border-outline-variant/30">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
        {/* Action Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase text-outline flex items-center gap-1">
            <Tag className="w-3 h-3 text-primary" />
            <span>Action Name</span>
          </label>
          <div className="relative">
            <input
              type="text"
              list="audit-actions-list"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. ORDER_STATUS_CHANGED"
              maxLength={100}
              className="w-full bg-surface-container-lowest text-on-surface font-mono text-xs px-3 py-2 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            <datalist id="audit-actions-list">
              {COMMON_ACTIONS.map((act) => (
                <option key={act} value={act} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Resource Type Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase text-outline flex items-center gap-1">
            <Filter className="w-3 h-3 text-secondary" />
            <span>Resource Type</span>
          </label>
          <div className="relative">
            <input
              type="text"
              list="audit-resources-list"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              placeholder="e.g. order"
              maxLength={100}
              className="w-full bg-surface-container-lowest text-on-surface font-mono text-xs px-3 py-2 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            <datalist id="audit-resources-list">
              {COMMON_RESOURCES.map((res) => (
                <option key={res} value={res} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Resource ID Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase text-outline flex items-center gap-1">
            <Hash className="w-3 h-3 text-outline" />
            <span>Resource ID</span>
          </label>
          <input
            type="text"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            placeholder="e.g. ORD-20261027-F7A9B1"
            maxLength={100}
            className="w-full bg-surface-container-lowest text-on-surface font-mono text-xs px-3 py-2 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Actor ObjectId Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[11px] uppercase text-outline flex items-center gap-1">
            <User className="w-3 h-3 text-tertiary" />
            <span>Actor ObjectId</span>
          </label>
          <input
            type="text"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="24-char hex ID"
            maxLength={24}
            className={`w-full bg-surface-container-lowest text-on-surface font-mono text-xs px-3 py-2 rounded-lg border focus:outline-none ${
              actorError ? 'border-error' : 'border-outline-variant/30 focus:border-primary'
            }`}
          />
        </div>
      </div>

      {actorError && (
        <span className="font-mono text-xs text-error">{actorError}</span>
      )}

      {/* Date Range & Controls Bottom Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-outline-variant/20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-outline uppercase">Date Range (UTC):</span>
          <div className="flex items-center bg-surface-container-lowest rounded-lg px-2.5 py-1.5 border border-outline-variant/30 text-on-surface gap-1.5 font-mono text-xs">
            <Calendar className="w-3.5 h-3.5 text-outline flex-shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-on-surface focus:outline-none"
              title="Start date (UTC)"
            />
            <span className="text-outline">&rarr;</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-on-surface focus:outline-none"
              title="End date (UTC)"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-outline hover:text-on-surface ml-1 p-0.5"
                title="Clear date range"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {dateError && (
            <span className="font-mono text-xs text-error">{dateError}</span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-outline hover:text-on-surface font-mono text-xs bg-surface-container hover:bg-surface-container-high transition-colors self-end sm:self-auto border border-outline-variant/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}

