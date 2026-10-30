import React, { useState } from 'react';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../../../lib/formatters.js';
import {
  checkOrderTransitionEligibility,
  checkOrderCancellationEligibility
} from '../orderValidation.js';
import {
  Package,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Ban,
  ArrowRight,
  Copy,
  Check,
  MapPin,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

export function OrdersTable({
  orders = [],
  meta,
  isLoading = false,
  isRefreshing = false,
  onPageChange,
  onInspectOrder,
  onAdvanceStatus,
  onCancelOrder,
  onRefresh
}) {
  const [copiedRef, setCopiedRef] = useState(null);

  const handleCopy = (ref, e) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(ref);
      setCopiedRef(ref);
      setTimeout(() => setCopiedRef(null), 2000);
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'awaiting_payment':
        return {
          label: 'Awaiting Payment',
          className: 'bg-surface-container text-outline border border-outline-variant/30',
          icon: Clock
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          className: 'bg-primary-container text-on-primary-container font-semibold',
          icon: CheckCircle2
        };
      case 'processing':
        return {
          label: 'Processing',
          className: 'bg-tertiary/20 text-tertiary border border-tertiary/40 font-semibold',
          icon: RefreshCw
        };
      case 'shipped':
        return {
          label: 'Shipped',
          className: 'bg-primary/20 text-primary border border-primary/30 font-semibold',
          icon: Truck
        };
      case 'delivered':
        return {
          label: 'Delivered',
          className: 'bg-secondary-container text-on-secondary-container font-semibold',
          icon: CheckCircle2
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-error-container text-on-error-container font-semibold',
          icon: Ban
        };
      default:
        return {
          label: (status || 'Unknown').toUpperCase(),
          className: 'bg-surface-container text-outline',
          icon: Package
        };
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return {
          label: 'PAID',
          className: 'bg-secondary-container/40 text-secondary border border-secondary/30'
        };
      case 'cod_due':
        return {
          label: 'COD DUE',
          className: 'bg-tertiary-container/30 text-tertiary border border-tertiary/30'
        };
      case 'pending':
        return {
          label: 'PENDING',
          className: 'bg-surface-container text-outline border border-outline-variant/30'
        };
      case 'failed':
        return {
          label: 'FAILED',
          className: 'bg-error-container text-on-error-container border border-error/30'
        };
      case 'refunded':
        return {
          label: 'REFUNDED',
          className: 'bg-surface-container text-outline'
        };
      default:
        return {
          label: (status || '—').toUpperCase(),
          className: 'bg-surface-container text-outline'
        };
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm space-y-0">
      {/* Table Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-wider text-outline">
            {meta?.total !== undefined ? `${meta.total} Matching Orders` : 'Orders Queue'}
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-outline-variant/30 disabled:opacity-50"
          title="Refresh orders queue"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-outline ${isRefreshing ? 'animate-spin text-primary' : ''}`}
          />
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/60 text-outline uppercase font-mono text-[11px] tracking-wider border-b border-outline-variant/30">
              <th className="py-3 px-4">Order Reference</th>
              <th className="py-3 px-4">Customer &amp; Location</th>
              <th className="py-3 px-4">Line Items</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Fulfillment Stage</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-body text-sm text-on-surface">
            {isLoading && orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-outline font-mono text-xs">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <span>Loading fulfillment queue...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-outline">
                  <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                    <Package className="w-10 h-10 text-outline-variant" />
                    <span className="font-headline font-semibold text-base text-on-surface">
                      No Orders Found
                    </span>
                    <p className="text-xs text-outline font-mono">
                      No customer orders match the selected search, status, or date range filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusBadge = getOrderStatusBadge(order.orderStatus);
                const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
                const StatusIcon = statusBadge.icon;

                const firstItem = order.items?.[0];
                const itemsCount = order.items?.length || 0;

                // Eligibility checks for quick action buttons
                const transitionToProcessing = checkOrderTransitionEligibility(order, 'processing');
                const transitionToShipped = checkOrderTransitionEligibility(order, 'shipped');
                const transitionToDelivered = checkOrderTransitionEligibility(order, 'delivered');
                const cancelEligibility = checkOrderCancellationEligibility(order);

                return (
                  <tr
                    key={order._id || order.orderReference}
                    onClick={() => onInspectOrder(order)}
                    className="hover:bg-surface-container/60 transition-colors cursor-pointer group"
                  >
                    {/* Order Reference & Timestamp */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-primary bg-primary-container/20 px-2 py-0.5 rounded">
                          {order.orderReference}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(order.orderReference, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-outline hover:text-on-surface"
                          title="Copy order reference"
                        >
                          {copiedRef === order.orderReference ? (
                            <Check className="w-3.5 h-3.5 text-secondary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="font-mono text-[11px] text-outline block mt-0.5">
                        {formatDateTime(order.createdAt)}{' '}
                        <span className="text-outline-variant">
                          ({formatRelativeTime(order.createdAt)})
                        </span>
                      </span>
                    </td>

                    {/* Customer & Location */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-headline font-semibold text-xs text-on-surface line-clamp-1">
                          {order.shippingAddress?.recipientName ||
                            (order.customer
                              ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
                              : 'Customer')}
                        </span>
                        <div className="flex items-center gap-1 text-outline font-mono text-[11px]">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {order.shippingAddress?.city || '—'}, {order.shippingAddress?.country || ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Line Items */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-surface-container px-2 py-0.5 rounded text-on-surface font-semibold flex-shrink-0">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                        {firstItem && (
                          <span className="font-mono text-xs text-on-surface-variant truncate max-w-[180px]">
                            {firstItem.sku}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-on-surface">
                        {formatCurrency(order.totalCents, order.currency)}
                      </div>
                    </td>

                    {/* Payment State */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-outline font-semibold uppercase">
                          {order.paymentMethod === 'cod' ? 'C.O.D.' : 'ONLINE'}
                        </span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${paymentBadge.className}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </div>
                    </td>

                    {/* Fulfillment Stage */}
                    <td className="py-3 px-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs ${statusBadge.className}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span className="uppercase tracking-wider">{statusBadge.label}</span>
                      </div>
                    </td>

                    {/* Quick Execution Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Process: confirmed -> processing */}
                        {order.orderStatus === 'confirmed' && transitionToProcessing.allowed && (
                          <button
                            type="button"
                            onClick={() => onAdvanceStatus(order, 'processing')}
                            className="px-2.5 py-1 bg-primary text-on-primary font-headline text-xs font-semibold rounded hover:opacity-90 transition-opacity shadow-sm"
                          >
                            Process
                          </button>
                        )}

                        {/* Ship: processing -> shipped */}
                        {order.orderStatus === 'processing' && transitionToShipped.allowed && (
                          <button
                            type="button"
                            onClick={() => onAdvanceStatus(order, 'shipped')}
                            className="px-2.5 py-1 bg-primary text-on-primary font-headline text-xs font-semibold rounded hover:opacity-90 transition-opacity shadow-sm flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {/* Deliver: shipped -> delivered */}
                        {order.orderStatus === 'shipped' && transitionToDelivered.allowed && (
                          <button
                            type="button"
                            onClick={() => onAdvanceStatus(order, 'delivered')}
                            className="px-2.5 py-1 bg-secondary text-on-secondary font-headline text-xs font-semibold rounded hover:opacity-90 transition-opacity shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Deliver</span>
                          </button>
                        )}

                        {/* Inspect Details Button */}
                        <button
                          type="button"
                          onClick={() => onInspectOrder(order)}
                          className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
                          title="Inspect order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Cancel Button (if eligible) */}
                        {cancelEligibility.cancellable && (
                          <button
                            type="button"
                            onClick={() => onCancelOrder(order)}
                            className="p-1.5 rounded bg-error-container/20 text-error hover:bg-error hover:text-on-error transition-colors"
                            title="Cancel order"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
  );
}

