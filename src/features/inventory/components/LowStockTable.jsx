import React from 'react';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { formatNumber } from '../../../lib/formatters.js';
import {
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Sliders,
  X,
  ShieldAlert
} from 'lucide-react';

const LOW_STOCK_SORT_OPTIONS = [
  { value: 'available:asc', label: 'Sort: Lowest Available (Most Urgent)' },
  { value: 'available:desc', label: 'Sort: Highest Available' },
  { value: 'physical:asc', label: 'Sort: Lowest Physical' },
  { value: 'sku:asc', label: 'Sort: SKU Code (A-Z)' },
  { value: 'name:asc', label: 'Sort: Product Name (A-Z)' }
];

export function LowStockTable({
  products = [],
  meta,
  isLoading = false,
  isRefreshing = false,
  onPageChange,
  onAdjustStock,
  onRefresh,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  selectedSort,
  setSelectedSort
}) {
  return (
    <div className="space-y-4">
      {/* Alert Header Banner */}
      <div className="p-4 rounded-xl bg-error-container/15 border border-error/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-error-container text-on-error-container">
            <ShieldAlert className="w-5 h-5 text-error" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wide">
              Critical Low Stock Threshold Alerts
            </h3>
            <p className="text-xs text-on-surface-variant font-mono">
              Products where Net Available Stock &le; Safety Threshold. Immediate replenishment recommended.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-error-container text-on-error-container font-bold">
            {meta?.total !== undefined ? `${meta.total} CRITICAL SKUS` : 'ALERTS ACTIVE'}
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border border-outline-variant/30 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-lg flex-1 min-w-[220px] max-w-md border border-outline-variant/30 focus-within:border-primary/50 transition-colors">
            <Search className="w-4 h-4 text-outline flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search low-stock SKUs or products..."
              className="bg-transparent font-mono text-xs text-on-surface placeholder:text-outline-variant focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-outline hover:text-on-surface"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-surface-container font-mono text-xs text-on-surface px-3 py-2 rounded-lg appearance-none pr-8 border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug || cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-outline absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Sort & Refresh */}
        <div className="flex items-center gap-2 justify-end">
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-surface-container font-mono text-xs text-on-surface px-3 py-2 rounded-lg appearance-none pr-8 border border-outline-variant/30 focus:outline-none cursor-pointer"
            >
              {LOW_STOCK_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Sliders className="w-3.5 h-3.5 text-outline absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            className="p-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg transition-colors border border-outline-variant/30 disabled:opacity-50"
            title="Refresh low stock report"
          >
            <RefreshCw
              className={`w-4 h-4 text-outline ${isRefreshing ? 'animate-spin text-primary' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Critical Stock Table */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-mono text-[11px] text-outline uppercase tracking-wider border-b border-outline-variant/30">
                <th className="py-3 px-4">Product &amp; SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Physical Shelved</th>
                <th className="py-3 px-4 text-right">Reserved (Carts)</th>
                <th className="py-3 px-4 text-right">Net Available</th>
                <th className="py-3 px-4 text-right">Safety Threshold</th>
                <th className="py-3 px-4 text-center">Deficit Below Safety</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body text-sm text-on-surface">
              {isLoading && products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-outline font-mono text-xs">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span>Loading low-stock inventory report...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-outline">
                    <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <AlertTriangle className="w-10 h-10 text-secondary" />
                      <span className="font-headline font-semibold text-base text-on-surface">
                        Zero Critical Deficits
                      </span>
                      <p className="text-xs text-outline">
                        All catalog products are operating above their minimum stock thresholds.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((item) => {
                  const physical = item.stock?.physical ?? 0;
                  const reserved = item.stock?.reserved ?? 0;
                  const available = item.stock?.available ?? 0;
                  const threshold = item.lowStockThreshold ?? 10;
                  const unitsBelow = item.unitsBelowThreshold ?? Math.max(0, threshold - available);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-surface-container/50 transition-colors bg-error-container/5"
                    >
                      {/* Product & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-headline font-medium text-on-surface line-clamp-1">
                            {item.name}
                          </span>
                          <span className="font-mono text-xs text-primary font-semibold tracking-wide">
                            {item.sku}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/20">
                          {item.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Physical Shelved */}
                      <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-on-surface">
                        {formatNumber(physical)}
                      </td>

                      {/* Reserved in Carts */}
                      <td className="py-3 px-4 text-right font-mono text-xs text-tertiary">
                        {reserved > 0 ? (
                          <span className="bg-tertiary/10 px-2 py-0.5 rounded text-tertiary font-semibold">
                            {formatNumber(reserved)} in carts
                          </span>
                        ) : (
                          <span className="text-outline">0</span>
                        )}
                      </td>

                      {/* Net Available */}
                      <td className="py-3 px-4 text-right font-mono">
                        <span className="text-sm font-bold text-error">
                          {formatNumber(available)}
                        </span>
                      </td>

                      {/* Safety Threshold */}
                      <td className="py-3 px-4 text-right font-mono text-sm text-outline">
                        {formatNumber(threshold)}
                      </td>

                      {/* Deficit Below Threshold */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-0.5 rounded bg-error-container text-on-error-container font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-error animate-pulse" />
                          -{formatNumber(unitsBelow)} UNITS DEFICIT
                        </span>
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onAdjustStock(item)}
                          className="px-3 py-1.5 rounded font-headline text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-all shadow-sm flex items-center gap-1 ml-auto"
                        >
                          Replenish Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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

