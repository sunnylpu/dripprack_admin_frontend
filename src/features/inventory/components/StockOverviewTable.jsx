import React from 'react';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { formatNumber } from '../../../lib/formatters.js';
import {
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  X,
  Package
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Sort: Newest Added' },
  { value: 'available:asc', label: 'Sort: Lowest Available First' },
  { value: 'available:desc', label: 'Sort: Highest Available First' },
  { value: 'physical:asc', label: 'Sort: Lowest Physical First' },
  { value: 'physical:desc', label: 'Sort: Highest Physical First' },
  { value: 'sku:asc', label: 'Sort: SKU Code (A-Z)' },
  { value: 'sku:desc', label: 'Sort: SKU Code (Z-A)' },
  { value: 'name:asc', label: 'Sort: Product Name (A-Z)' }
];

export function StockOverviewTable({
  stock = [],
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
  lowStockOnly,
  setLowStockOnly,
  inStock,
  setInStock,
  selectedSort,
  setSelectedSort
}) {
  return (
    <div className="space-y-4">
      {/* Tactical Controls & Filters Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border border-outline-variant/30 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Monospace Search Input */}
          <div className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-lg flex-1 min-w-[220px] max-w-md border border-outline-variant/30 focus-within:border-primary/50 transition-colors">
            <Search className="w-4 h-4 text-outline flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU or product name..."
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
            <span className="font-mono text-[10px] text-outline bg-surface-container-high px-1 py-0.5 rounded">
              /
            </span>
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

          {/* Quick Filter: Low Stock Only */}
          <button
            type="button"
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all border ${
              lowStockOnly
                ? 'bg-error-container text-on-error-container border-error/50 font-bold shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface border-outline-variant/30'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-error" />
            <span>Low Stock Only</span>
          </button>

          {/* Quick Filter: In-Stock Only */}
          <button
            type="button"
            onClick={() => {
              if (inStock === 'true') {
                setInStock('all');
              } else {
                setInStock('true');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-all border ${
              inStock === 'true'
                ? 'bg-secondary-container text-on-secondary-container border-secondary/50 font-bold shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface border-outline-variant/30'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
            <span>In-Stock Only</span>
          </button>
        </div>

        {/* Sort and Refresh Controls */}
        <div className="flex items-center gap-2 justify-end">
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-surface-container font-mono text-xs text-on-surface px-3 py-2 rounded-lg appearance-none pr-8 border border-outline-variant/30 focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
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
            title="Refresh stock levels"
          >
            <RefreshCw
              className={`w-4 h-4 text-outline ${isRefreshing ? 'animate-spin text-primary' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Stock Table */}
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
                <th className="py-3 px-4">Safety Threshold</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body text-sm text-on-surface">
              {isLoading && stock.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-outline font-mono text-xs">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <span>Loading active warehouse stock...</span>
                    </div>
                  </td>
                </tr>
              ) : stock.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-outline">
                    <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <Package className="w-10 h-10 text-outline-variant" />
                      <span className="font-headline font-semibold text-base text-on-surface">
                        No Stock Items Found
                      </span>
                      <p className="text-xs text-outline">
                        No products match your current search, category, or stock availability filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                stock.map((item) => {
                  const physical = item.stock?.physical ?? 0;
                  const reserved = item.stock?.reserved ?? 0;
                  const available = item.stock?.available ?? 0;
                  const threshold = item.lowStockThreshold;
                  const isLow = item.isLowStock || (typeof threshold === 'number' && available <= threshold);
                  const capacityRatio = typeof threshold === 'number' && threshold > 0 ? Math.min(Math.round((available / threshold) * 100), 100) : 100;

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-surface-container/50 transition-colors ${
                        isLow ? 'bg-error-container/5' : ''
                      }`}
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
                        <span
                          className={`text-sm font-bold ${
                            isLow ? 'text-error' : 'text-secondary'
                          }`}
                        >
                          {formatNumber(available)}
                        </span>
                        <span className="block text-[10px] text-outline uppercase">
                          MIN: {typeof threshold === 'number' ? formatNumber(threshold) : '—'}
                        </span>
                      </td>

                      {/* Threshold Progress */}
                      <td className="py-3 px-4 min-w-[130px]">
                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[10px] text-outline">
                            <span>{isLow ? `${capacityRatio}% depleted` : 'Optimal'}</span>
                            <span>{available} / {typeof threshold === 'number' ? threshold : '—'}</span>
                          </div>
                          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isLow ? 'bg-error' : 'bg-secondary'
                              }`}
                              style={{ width: `${Math.max(capacityRatio, 4)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-error-container text-on-error-container font-semibold">
                            <AlertTriangle className="w-3 h-3 text-error animate-pulse" />
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-secondary" />
                            HEALTHY
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onAdjustStock(item)}
                          className={`px-3 py-1 rounded font-headline text-xs font-semibold transition-all shadow-sm ${
                            isLow
                              ? 'bg-primary text-on-primary hover:opacity-90'
                              : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                          }`}
                        >
                          Adjust Stock
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

