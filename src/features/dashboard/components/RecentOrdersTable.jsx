import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatRelativeTime, formatDateTime } from '../../../lib/formatters.js';
import { Search, ExternalLink, ArrowRight, Package, Filter, AlertCircle } from 'lucide-react';

function getOrderStatusBadge(status) {
  switch (status) {
    case 'delivered':
      return {
        bg: 'bg-secondary/15',
        text: 'text-secondary',
        border: 'border-secondary/30',
        label: 'DELIVERED'
      };
    case 'shipped':
      return {
        bg: 'bg-secondary-container/20',
        text: 'text-secondary',
        border: 'border-secondary-container/30',
        label: 'SHIPPED'
      };
    case 'processing':
      return {
        bg: 'bg-primary/15',
        text: 'text-primary',
        border: 'border-primary/30',
        label: 'PROCESSING'
      };
    case 'confirmed':
      return {
        bg: 'bg-primary-container/20',
        text: 'text-primary',
        border: 'border-primary-container/30',
        label: 'CONFIRMED'
      };
    case 'cancelled':
      return {
        bg: 'bg-error-container/20',
        text: 'text-error',
        border: 'border-error/30',
        label: 'CANCELLED'
      };
    case 'awaiting_payment':
    default:
      return {
        bg: 'bg-tertiary-container/20',
        text: 'text-tertiary',
        border: 'border-tertiary/30',
        label: 'AWAITING PAY'
      };
  }
}

function getPaymentBadge(method, status) {
  const methodLabel = method ? method.toUpperCase() : 'ONLINE';
  const isPaid = status === 'paid';
  const isFailed = status === 'failed';

  if (isPaid) {
    return {
      dot: 'bg-secondary',
      text: 'text-secondary',
      bg: 'bg-secondary/10',
      border: 'border-secondary/20',
      label: `${methodLabel} • PAID`
    };
  }

  if (isFailed) {
    return {
      dot: 'bg-error',
      text: 'text-error',
      bg: 'bg-error-container/20',
      border: 'border-error/30',
      label: `${methodLabel} • FAILED`
    };
  }

  return {
    dot: 'bg-tertiary',
    text: 'text-tertiary',
    bg: 'bg-tertiary/10',
    border: 'border-tertiary/20',
    label: method === 'cod' ? 'COD • DUE' : `${methodLabel} • PENDING`
  };
}

export function RecentOrdersTable({ recentOrders = [], defaultCurrency = 'USD' }) {
  const [filterQuery, setFilterQuery] = useState('');

  // Client-side filter across the 10 recent records
  const filteredOrders = recentOrders.filter((order) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const ref = (order.orderReference || '').toLowerCase();
    const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.toLowerCase();
    const customerEmail = (order.customer?.email || '').toLowerCase();
    return ref.includes(q) || customerName.includes(q) || customerEmail.includes(q);
  });

  return (
    <section className="bg-surface-container-low rounded-xl shadow-xl overflow-hidden border border-outline-variant/30 flex flex-col">
      {/* Table Header & Controls Bar */}
      <div className="p-5 bg-surface-container-low border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              LATEST ORDERS SNAPSHOT
            </span>
            <span className="px-2 py-0.5 rounded bg-primary-container/20 border border-primary-container/40 text-primary font-mono text-[11px] font-semibold">
              LATEST {recentOrders.length} ORDERS
            </span>
          </div>
          <h2 className="font-headline text-lg font-bold text-on-surface mt-0.5">
            Recent Orders Snapshot
          </h2>
        </div>

        {/* Search & Navigation Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant/30 text-outline">
            <Search className="w-4 h-4 mr-2 shrink-0 text-outline" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter ref or customer..."
              className="bg-transparent border-none outline-none font-mono text-xs text-on-surface placeholder:text-outline/60 w-44 sm:w-56"
            />
          </div>

          <Link
            to="/orders"
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-container text-on-primary font-headline text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="View complete order pipeline (Phase 5)"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full">
        {filteredOrders.length > 0 ? (
          <table className="w-full text-left border-collapse" id="ordersTable">
            <thead>
              <tr className="bg-surface-container-lowest text-outline font-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/20">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer Info</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment State</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface font-body text-xs">
              {filteredOrders.map((order) => {
                const statusBadge = getOrderStatusBadge(order.orderStatus);
                const paymentBadge = getPaymentBadge(order.paymentMethod, order.paymentStatus);
                const customerName = order.customer
                  ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Customer'
                  : 'Guest / Unassigned';
                const customerEmail = order.customer?.email || '—';
                const currency = order.currency || defaultCurrency;

                return (
                  <tr
                    key={order._id || order.orderReference}
                    className="hover:bg-surface-container/60 transition-colors group"
                  >
                    {/* Order Reference */}
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      <span
                        className="text-primary bg-surface-container-lowest px-2 py-1 rounded inline-block border border-outline-variant/20 cursor-default"
                        title={order.orderReference}
                      >
                        {order.orderReference}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col min-w-0 max-w-xs">
                        <span className="font-headline font-semibold text-on-surface truncate">
                          {customerName}
                        </span>
                        <span
                          className="font-mono text-[11px] text-outline truncate"
                          title={customerEmail}
                        >
                          {customerEmail}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-outline whitespace-nowrap">
                      <span title={formatDateTime(order.createdAt)}>
                        {formatRelativeTime(order.createdAt)}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-on-surface whitespace-nowrap">
                      {formatCurrency(order.totalCents, currency)}
                    </td>

                    {/* Payment State */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] font-semibold border ${paymentBadge.bg} ${paymentBadge.text} ${paymentBadge.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${paymentBadge.dot}`} />
                        {paymentBadge.label}
                      </span>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] uppercase font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to="/orders"
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-mono text-[11px] transition-colors inline-flex items-center gap-1 border border-outline-variant/20"
                        title="Order detail management planned for Phase 5"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3 text-outline" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3 border border-outline-variant/30">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-sm text-on-surface mb-1">
              {recentOrders.length === 0 ? 'No Orders Recorded Yet' : 'No Matching Orders Found'}
            </h3>
            <p className="font-body text-xs text-outline max-w-sm">
              {recentOrders.length === 0
                ? 'When customers complete checkout transactions, incoming orders will stream here automatically.'
                : `No recent orders matched your filter "${filterQuery}". Clear the filter to show all recent orders.`}
            </p>
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="mt-3 text-xs font-mono text-primary hover:underline"
              >
                Clear filter query
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table Footer Strip */}
      <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-outline gap-2">
        <span>BOUNDED TO LATEST 10 RECORDS FROM /admin/dashboard/summary</span>
        <Link to="/orders" className="hover:text-primary transition-colors flex items-center gap-1">
          <span>Go to Orders &amp; Fulfillment</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}

