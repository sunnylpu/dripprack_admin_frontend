import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ meta, onPageChange, className = '' }) {
  if (!meta || typeof meta.total !== 'number') {
    return null;
  }

  const {
    page = 1,
    limit = 20,
    total = 0,
    totalPages = 1,
    hasNextPage = false,
    hasPrevPage = false
  } = meta;

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className={`p-4 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-outline select-none ${className}`}>
      <div>
        Showing <span className="font-bold text-on-surface">{startRecord}</span>–<span className="font-bold text-on-surface">{endRecord}</span> of <span className="font-bold text-on-surface">{total}</span> records
      </div>

      <div className="flex items-center gap-2">
        <span className="mr-2">
          Page <strong className="text-on-surface">{page}</strong> of <strong className="text-on-surface">{Math.max(totalPages, 1)}</strong>
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

