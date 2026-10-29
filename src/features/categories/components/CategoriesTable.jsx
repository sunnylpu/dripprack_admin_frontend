import React from 'react';
import { formatDateTime } from '../../../lib/formatters.js';
import { Edit2, Trash2, CheckCircle2, XCircle, Folder, RefreshCw } from 'lucide-react';

export function CategoriesTable({
  categories = [],
  isLoading,
  onEdit,
  onDeactivate,
  onReactivate
}) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-surface-container-low rounded-lg" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3 border border-outline-variant/30">
          <Folder className="w-6 h-6" />
        </div>
        <h3 className="font-headline font-bold text-base text-on-surface mb-1">
          No Categories Found
        </h3>
        <p className="font-body text-xs text-outline max-w-sm">
          No category records matched your query or filter parameters. Create a category to start organizing your catalog taxonomy.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low font-mono text-[11px] uppercase tracking-wider text-outline select-none border-b border-outline-variant/20">
            <th className="py-3 px-4 font-normal">Category Identifier</th>
            <th className="py-3 px-4 font-normal">Description</th>
            <th className="py-3 px-4 font-normal">Status</th>
            <th className="py-3 px-4 font-normal">Created / Updated</th>
            <th className="py-3 px-4 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 text-on-surface font-body text-xs">
          {categories.map((cat) => {
            const isActive = Boolean(cat.isActive);

            return (
              <tr
                key={cat._id}
                className="hover:bg-surface-container/60 transition-colors group"
              >
                {/* Name, Slug & ID */}
                <td className="py-3.5 px-4 min-w-[240px]">
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-outline mt-0.5">
                      <span className="text-primary font-bold">/</span>
                      <span className="text-on-surface-variant font-medium">{cat.slug}</span>
                      <span className="text-outline-variant">•</span>
                      <span className="truncate max-w-[120px]" title={cat._id}>
                        {cat._id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Description */}
                <td className="py-3.5 px-4 max-w-xs xl:max-w-md">
                  <p className="text-outline truncate font-body text-xs">
                    {cat.description || <span className="italic text-outline/50">No description provided</span>}
                  </p>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20 text-secondary font-mono text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-error-container/20 border border-error/30 text-error font-mono text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error" />
                      INACTIVE
                    </span>
                  )}
                </td>

                {/* Timestamps */}
                <td className="py-3.5 px-4 font-mono text-outline text-[11px] whitespace-nowrap">
                  {formatDateTime(cat.updatedAt || cat.createdAt)}
                </td>

                {/* Action Buttons */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(cat)}
                      className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-primary border border-outline-variant/30 transition-colors"
                      title="Edit Category Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => onDeactivate(cat)}
                        className="p-1.5 rounded bg-surface-container hover:bg-error-container/20 text-outline hover:text-error border border-outline-variant/30 transition-colors"
                        title="Deactivate Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onReactivate(cat)}
                        className="p-1.5 rounded bg-surface-container hover:bg-secondary/20 text-outline hover:text-secondary border border-outline-variant/30 transition-colors"
                        title="Reactivate Category"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

