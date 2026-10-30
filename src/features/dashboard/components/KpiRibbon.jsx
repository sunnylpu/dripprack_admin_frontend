import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatNumber, calculatePercentage } from '../../../lib/formatters.js';
import { DollarSign, ShoppingBag, AlertTriangle, AlertCircle, ArrowUpRight } from 'lucide-react';

export function KpiRibbon({ summary }) {
  const {
    revenue = { totalRevenueCents: 0, paidOrdersCount: 0, currency: 'USD' },
    ordersByStatus = {},
    totalOrdersCount = 0,
    lowStockProductsCount = 0
  } = summary || {};

  // Orders in active fulfillment pipeline requiring operator attention
  const confirmedCount = ordersByStatus.confirmed || 0;
  const processingCount = ordersByStatus.processing || 0;
  const awaitingPaymentCount = ordersByStatus.awaiting_payment || 0;
  const actionRequiredCount = confirmedCount + processingCount;

  const paidRatio = calculatePercentage(revenue.paidOrdersCount, totalOrdersCount);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Metric 1: Recognized Paid Revenue */}
      <div className="bg-surface-container-low p-5 rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden group border border-outline-variant/30">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-outline font-medium">
            RECOGNIZED REVENUE
          </span>
          <span className="font-mono text-[11px] text-secondary bg-surface-container px-2 py-0.5 rounded border border-secondary/30 font-semibold" title="Backend aggregates orders with paymentStatus: paid">
            PAID ORDERS
          </span>
        </div>

        <div className="my-3">
          <div className="font-headline text-3xl font-bold text-on-surface tracking-tight">
            {formatCurrency(revenue.totalRevenueCents, revenue.currency)}
          </div>
          <div className="font-mono text-xs text-outline mt-1">
            totalRevenueCents: {formatNumber(revenue.totalRevenueCents)}
          </div>
        </div>

        <div className="flex items-center justify-between text-on-surface-variant pt-2 border-t border-outline-variant/20 text-xs font-body">
          <span>
            Paid Orders: <strong className="text-on-surface font-mono">{formatNumber(revenue.paidOrdersCount)}</strong>
          </span>
          <span className="text-[11px] font-mono text-outline" title="Aggregated by backend where paymentStatus === 'paid'">
            CURRENCY: {revenue.currency || 'USD'}
          </span>
        </div>
      </div>

      {/* Metric 2: Total Order Volume */}
      <div className="bg-surface-container-low p-5 rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-outline font-medium">
            TOTAL ORDER VOLUME
          </span>
          <span className="font-mono text-[11px] text-primary bg-surface-container px-2 py-0.5 rounded border border-primary/30 font-semibold">
            ALL LIFECYCLES
          </span>
        </div>

        <div className="my-3">
          <div className="font-headline text-3xl font-bold text-on-surface tracking-tight">
            {formatNumber(totalOrdersCount)}
          </div>
          <div className="font-mono text-xs text-outline mt-1 uppercase">
            Orders recorded in system
          </div>
        </div>

        <div className="flex items-center justify-between text-on-surface-variant pt-2 border-t border-outline-variant/20 text-xs font-body">
          <span>
            Paid Rate: <strong className="text-on-surface font-mono">{paidRatio}%</strong>
          </span>
          <span className="text-[11px] font-mono text-secondary">
            {formatNumber(revenue.paidOrdersCount)} PAID
          </span>
        </div>
      </div>

      {/* Metric 3: Orders Requiring Action */}
      <div className="bg-surface-container-low p-5 rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-tertiary font-medium">
            ACTION REQUIRED
          </span>
          {actionRequiredCount > 0 ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-tertiary-container/30 border border-tertiary/30 font-mono text-[11px] text-tertiary font-semibold">
              <span className="inline-flex rounded-full h-2 w-2 bg-tertiary" />
              <span>ACTIVE</span>
            </span>
          ) : (
            <span className="font-mono text-[11px] text-secondary bg-surface-container px-1.5 py-0.5 rounded">
              CLEAR
            </span>
          )}
        </div>

        <div className="my-3 flex items-baseline gap-2">
          <div className="font-headline text-3xl font-bold text-tertiary tracking-tight">
            {formatNumber(actionRequiredCount)}
          </div>
          <span className="font-mono text-xs text-tertiary uppercase font-medium">
            In Fulfillment Pipeline
          </span>
        </div>

        <div className="flex items-center justify-between text-on-surface-variant pt-2 border-t border-outline-variant/20 text-xs font-body">
          <span>
            Conf: <strong className="text-on-surface font-mono">{formatNumber(confirmedCount)}</strong> • Proc:{' '}
            <strong className="text-on-surface font-mono">{formatNumber(processingCount)}</strong>
          </span>
          <span className="text-[11px] font-mono text-outline">
            {awaitingPaymentCount} UNPAID
          </span>
        </div>
      </div>

      {/* Metric 4: Low Stock Alert */}
      <div className="bg-surface-container-low p-5 rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-error font-medium">
            CRITICAL STOCK
          </span>
          <Link
            to="/inventory"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-on-error-container text-xs font-mono font-semibold hover:opacity-90 transition-opacity"
            title="Navigate to Inventory operations"
          >
            <span>AUDIT</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="my-3 flex items-baseline gap-2">
          <div className="font-headline text-3xl font-bold text-error tracking-tight">
            {formatNumber(lowStockProductsCount)}
          </div>
          <span className="font-mono text-xs text-error uppercase font-medium">
            SKUs Under Threshold
          </span>
        </div>

        <div className="flex items-center justify-between text-on-surface-variant pt-2 border-t border-outline-variant/20 text-xs font-body">
          <span>
            Condition: <strong className="text-on-surface font-mono">Stock ≤ Threshold</strong>
          </span>
          <span className="text-[11px] font-mono text-outline">
            ACTIVE SKUS
          </span>
        </div>
      </div>
    </section>
  );
}

