import React from 'react';
import { formatNumber, calculatePercentage } from '../../../lib/formatters.js';
import { Package, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export function InventoryKpis({
  physicalUnits = 0,
  reservedUnits = 0,
  availableUnits = 0,
  lowStockCount = 0,
  isLoading = false
}) {
  const reservedRatio = calculatePercentage(reservedUnits, physicalUnits, 1);
  const availableRatio = calculatePercentage(availableUnits, physicalUnits, 1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest p-4 rounded-xl space-y-3 border border-outline-variant/30"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Physical Units */}
      <div className="bg-surface-container-lowest p-4 rounded-xl space-y-2 relative overflow-hidden border border-outline-variant/30 shadow-sm">
        <div className="absolute right-3 top-3 text-surface-container-highest/40">
          <Package className="w-10 h-10 stroke-[1.2]" />
        </div>
        <div className="font-mono text-xs uppercase text-on-surface-variant font-medium tracking-wide">
          Page Physical Units
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold text-on-surface">
            {formatNumber(physicalUnits)}
          </span>
          <span className="font-mono text-xs text-outline">On Page</span>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
        </div>
        <div className="text-xs text-outline">Summed across current page rows</div>
      </div>

      {/* KPI 2: Reserved Units */}
      <div className="bg-surface-container-lowest p-4 rounded-xl space-y-2 relative overflow-hidden border border-outline-variant/30 shadow-sm">
        <div className="absolute right-3 top-3 text-tertiary/20">
          <Lock className="w-10 h-10 stroke-[1.2]" />
        </div>
        <div className="font-mono text-xs uppercase text-on-surface-variant font-medium tracking-wide">
          Page Reserved Units
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold text-tertiary">
            {formatNumber(reservedUnits)}
          </span>
          <span className="font-mono text-xs text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded">
            {reservedRatio}% ratio
          </span>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-tertiary h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(reservedRatio, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-outline">Current page in-flight holds</div>
      </div>

      {/* KPI 3: Net Available Units */}
      <div className="bg-surface-container-lowest p-4 rounded-xl space-y-2 relative overflow-hidden border border-outline-variant/30 shadow-sm">
        <div className="absolute right-3 top-3 text-secondary/20">
          <CheckCircle2 className="w-10 h-10 stroke-[1.2]" />
        </div>
        <div className="font-mono text-xs uppercase text-on-surface-variant font-medium tracking-wide">
          Page Available Units
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold text-secondary">
            {formatNumber(availableUnits)}
          </span>
          <span className="font-mono text-xs text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">
            {availableRatio}% allocatable
          </span>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-secondary h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(availableRatio, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-outline">Current page ready-to-sell stock</div>
      </div>

      {/* KPI 4: Low Stock Alert SKUs */}
      <div className="bg-surface-container-lowest p-4 rounded-xl space-y-2 relative overflow-hidden border border-outline-variant/30 shadow-sm">
        <div className="absolute right-3 top-3 text-error/20">
          <AlertTriangle className="w-10 h-10 stroke-[1.2]" />
        </div>
        <div className="font-mono text-xs uppercase text-error font-medium tracking-wide flex items-center gap-1.5">
          {lowStockCount > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
            </span>
          )}
          Catalog Low Stock SKUs
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold text-error">
            {formatNumber(lowStockCount)}
          </span>
          <span
            className={`font-mono text-xs px-1.5 py-0.5 rounded ${
              lowStockCount > 0
                ? 'bg-error-container text-on-error-container'
                : 'bg-surface-container text-outline'
            }`}
          >
            {lowStockCount > 0 ? 'CRITICAL' : 'NOMINAL'}
          </span>
        </div>
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              lowStockCount > 0 ? 'bg-error' : 'bg-secondary'
            }`}
            style={{ width: lowStockCount > 0 ? '100%' : '15%' }}
          ></div>
        </div>
        <div className="text-xs text-outline">
          {lowStockCount > 0 ? 'Catalog SKUs at or below threshold' : 'All SKUs above threshold'}
        </div>
      </div>
    </div>
  );
}

