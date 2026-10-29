import React from 'react';
import { formatCurrency } from '../../../lib/formatters.js';
import { Edit2, MoreVertical, Package, ImageOff } from 'lucide-react';

function getProductStatusBadge(status) {
  switch (status) {
    case 'published':
      return {
        bg: 'bg-secondary/10',
        text: 'text-secondary',
        border: 'border-secondary/20',
        dot: 'bg-secondary',
        label: 'Published'
      };
    case 'archived':
      return {
        bg: 'bg-error-container/20',
        text: 'text-error',
        border: 'border-error/30',
        dot: 'bg-error',
        label: 'Archived'
      };
    case 'draft':
    default:
      return {
        bg: 'bg-surface-container-highest',
        text: 'text-outline',
        border: 'border-outline-variant/30',
        dot: 'bg-outline',
        label: 'Draft'
      };
  }
}

export function ProductsTable({
  products = [],
  currency = 'USD',
  isLoading,
  onEdit,
  onChangeStatus
}) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-surface-container-low rounded-lg" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3 border border-outline-variant/30">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="font-headline font-bold text-base text-on-surface mb-1">
          No Products Found
        </h3>
        <p className="font-body text-xs text-outline max-w-sm">
          No product catalog records matched your active filter or search criteria. Try modifying your filters or create a new SKU.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low text-outline font-mono text-[11px] uppercase tracking-wider select-none border-b border-outline-variant/20">
            <th className="py-3 px-4 font-normal">Product / SKU Identifier</th>
            <th className="py-3 px-4 font-normal">Taxonomy</th>
            <th className="py-3 px-4 font-normal">Selling / Compare Price</th>
            <th className="py-3 px-4 font-normal text-center">Available Alloc</th>
            <th className="py-3 px-4 font-normal">Breakdown (Phys / Res)</th>
            <th className="py-3 px-4 font-normal">Status</th>
            <th className="py-3 px-4 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 text-on-surface font-body text-xs">
          {products.map((product) => {
            const statusBadge = getProductStatusBadge(product.status);
            const categoryName = typeof product.category === 'object' && product.category !== null
              ? product.category.name || product.category.slug || 'Category'
              : 'Unassigned';

            const primaryImage = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : null;

            const stock = product.stock || { physical: 0, reserved: 0, available: 0 };
            const isLowStock = stock.available <= (product.lowStockThreshold ?? 5);

            return (
              <tr
                key={product._id}
                className="hover:bg-surface-container/60 transition-colors group"
              >
                {/* Product Thumbnail & SKU */}
                <td className="py-3.5 px-4 min-w-[260px]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shrink-0 overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full items-center justify-center text-outline/50 ${
                          primaryImage ? 'hidden' : 'flex'
                        }`}
                      >
                        <ImageOff className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-headline font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </span>
                      <span className="font-mono text-[11px] text-outline tracking-wider uppercase mt-0.5">
                        {product.sku}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Taxonomy / Category */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[11px] border border-outline-variant/30">
                    {categoryName}
                  </span>
                </td>

                {/* Selling & Compare Price */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex flex-col font-mono">
                    <span className="font-bold text-on-surface text-xs">
                      {formatCurrency(product.priceCents, currency)}
                    </span>
                    {product.compareAtPriceCents ? (
                      <span className="text-[11px] text-outline line-through">
                        {formatCurrency(product.compareAtPriceCents, currency)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-outline/40">—</span>
                    )}
                  </div>
                </td>

                {/* Available Stock Allocation */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                      stock.available === 0
                        ? 'bg-surface-container-high text-outline border-outline-variant/30'
                        : isLowStock
                        ? 'bg-tertiary/10 text-tertiary border-tertiary/30'
                        : 'bg-secondary/10 text-secondary border-secondary/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        stock.available === 0
                          ? 'bg-outline'
                          : isLowStock
                          ? 'bg-tertiary'
                          : 'bg-secondary'
                      }`}
                    />
                    <span>{stock.available}</span>
                  </div>
                </td>

                {/* Breakdown (Phys / Res) */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex flex-col font-mono text-[11px] text-outline">
                    <span>
                      Physical: <strong className="text-on-surface">{stock.physical}</strong>
                    </span>
                    <span>
                      Reserved: <strong className={stock.reserved > 0 ? 'text-tertiary' : 'text-outline'}>{stock.reserved}</strong>
                    </span>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${statusBadge.dot}`} />
                    <span>{statusBadge.label}</span>
                  </span>
                </td>

                {/* Action Buttons */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-primary border border-outline-variant/30 transition-colors"
                      title="Edit Product Catalog Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onChangeStatus(product)}
                      className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface border border-outline-variant/30 transition-colors"
                      title="Update Lifecycle Status"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
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

