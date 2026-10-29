import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber, calculatePercentage } from '../../../lib/formatters.js';
import {
  Clock,
  CheckCircle,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  ChevronRight,
  Send,
  Terminal
} from 'lucide-react';

const STATUS_CONFIGS = [
  {
    key: 'awaiting_payment',
    label: 'Awaiting Pay',
    colorBg: 'bg-tertiary-container',
    colorDot: 'bg-tertiary',
    textColor: 'text-tertiary',
    icon: Clock
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    colorBg: 'bg-primary-container',
    colorDot: 'bg-primary-container',
    textColor: 'text-primary',
    icon: CheckCircle
  },
  {
    key: 'processing',
    label: 'Processing',
    colorBg: 'bg-primary',
    colorDot: 'bg-primary',
    textColor: 'text-primary',
    icon: Package
  },
  {
    key: 'shipped',
    label: 'Shipped',
    colorBg: 'bg-secondary-container',
    colorDot: 'bg-secondary-container',
    textColor: 'text-secondary',
    icon: Truck
  },
  {
    key: 'delivered',
    label: 'Delivered',
    colorBg: 'bg-secondary',
    colorDot: 'bg-secondary',
    textColor: 'text-secondary',
    icon: CheckCircle2
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    colorBg: 'bg-error-container',
    colorDot: 'bg-error',
    textColor: 'text-error',
    icon: XCircle
  }
];

export function OrderPipelineDistribution({ ordersByStatus = {}, totalOrdersCount = 0 }) {
  const hasOrders = totalOrdersCount > 0;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Order Pipeline Distribution Breakdown (8 cols) */}
      <div className="lg:col-span-8 bg-surface-container-low p-6 rounded-xl shadow-lg border border-outline-variant/30 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-outline-variant/20">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-primary font-semibold">
                FLOW VECTOR
              </span>
              <h2 className="font-headline text-lg font-bold text-on-surface mt-0.5">
                Order Pipeline Distribution
              </h2>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-outline bg-surface-container px-2.5 py-1 rounded border border-outline-variant/30">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>TOTAL: {formatNumber(totalOrdersCount)} ORDERS</span>
            </div>
          </div>

          {/* Composite Ratio Bar */}
          <div className="w-full h-5 rounded overflow-hidden bg-surface-container-lowest my-5 gap-0.5 p-0.5 flex border border-outline-variant/30">
            {hasOrders ? (
              STATUS_CONFIGS.map((cfg) => {
                const count = ordersByStatus[cfg.key] || 0;
                const percentage = calculatePercentage(count, totalOrdersCount, 1);
                if (percentage <= 0) return null;

                return (
                  <div
                    key={cfg.key}
                    className={`${cfg.colorBg} rounded-sm transition-all`}
                    style={{ width: `${percentage}%` }}
                    title={`${cfg.label}: ${count} (${percentage}%)`}
                  />
                );
              })
            ) : (
              <div className="w-full bg-surface-container rounded-sm flex items-center justify-center text-[10px] font-mono text-outline">
                NO ORDERS RECORDED
              </div>
            )}
          </div>

          {/* Status Breakdown Legend Grid (6 Statuses) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-4">
            {STATUS_CONFIGS.map((cfg) => {
              const count = ordersByStatus[cfg.key] || 0;
              const percentage = calculatePercentage(count, totalOrdersCount, 1);

              return (
                <div
                  key={cfg.key}
                  className="bg-surface-container p-3 rounded-lg flex flex-col justify-between border border-outline-variant/20"
                >
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-body truncate">
                    <span className={`w-2 h-2 rounded-full ${cfg.colorDot} shrink-0`} />
                    <span className="truncate">{cfg.label}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className={`font-headline text-lg font-bold font-mono ${count > 0 ? 'text-on-surface' : 'text-outline/70'}`}>
                      {formatNumber(count)}
                    </span>
                    <span className="font-mono text-[11px] text-outline">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-outline gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            DERIVED FROM BACKEND MONGODB AGGREGATION
          </span>
          <span className="uppercase">STATUS CATEGORIES: 6 OF 6</span>
        </div>
      </div>

      {/* Quick Action Operations Console (4 cols) */}
      <div className="lg:col-span-4 bg-surface-container-low p-6 rounded-xl shadow-lg border border-outline-variant/30 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              RUNBOOK SHORTCUTS
            </span>
            <span className="font-mono text-[11px] text-outline bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
              PLANNED (PHASE 5)
            </span>
          </div>

          <h3 className="font-headline text-base font-bold text-on-surface mt-3 mb-1">
            Fulfillment Quick-Actions
          </h3>
          <p className="font-body text-xs text-outline mb-4 leading-relaxed">
            Quick links to pending order queues. State transitions and tracking assignments will be executed in Phase 5.
          </p>

          <div className="space-y-2">
            <Link
              to="/orders"
              className="w-full flex items-center justify-between p-3 bg-surface-container hover:bg-surface-container-high rounded-lg text-left transition-colors group border border-outline-variant/20"
              title="Navigate to Orders Fulfillment"
            >
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="font-headline text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                    Fulfillment Pipeline
                  </div>
                  <div className="font-mono text-[11px] text-outline">
                    {formatNumber(ordersByStatus.confirmed || 0)} confirmed orders
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
            </Link>

            <Link
              to="/orders"
              className="w-full flex items-center justify-between p-3 bg-surface-container hover:bg-surface-container-high rounded-lg text-left transition-colors group border border-outline-variant/20"
              title="Navigate to Pending Orders"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-tertiary shrink-0" />
                <div>
                  <div className="font-headline text-xs font-bold text-on-surface group-hover:text-tertiary transition-colors">
                    Awaiting Payments Queue
                  </div>
                  <div className="font-mono text-[11px] text-outline">
                    {formatNumber(ordersByStatus.awaiting_payment || 0)} awaiting payment
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-outline group-hover:text-tertiary transition-colors" />
            </Link>
          </div>
        </div>

        <div className="mt-5 p-3 rounded bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-outline">
            <Terminal className="w-4 h-4 text-primary" />
            <span>FULFILLMENT OPERATIONS</span>
          </div>
          <span className="text-[11px] text-outline font-semibold uppercase">PLANNED FOR PHASE 5</span>
        </div>
      </div>
    </section>
  );
}

