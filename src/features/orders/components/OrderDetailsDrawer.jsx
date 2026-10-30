import React from 'react';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../../../lib/formatters.js';
import {
  checkOrderTransitionEligibility,
  checkOrderCancellationEligibility
} from '../orderValidation.js';
import { OrderTimeline } from './OrderTimeline.jsx';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Ban,
  DollarSign,
  MapPin,
  User,
  CreditCard,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export function OrderDetailsDrawer({
  isOpen,
  onClose,
  orderDetail,
  isLoading = false,
  onAdvanceStatus,
  onCancelOrder
}) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const order = orderDetail?.order;
  const payment = orderDetail?.payment;
  const auditLogs = orderDetail?.auditLogs || [];

  if (isLoading || !order) {
    return (
      <>
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Loading Order Dossier"
          className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface-container-low shadow-2xl z-50 flex flex-col border-l border-outline-variant/30"
        >
          <div className="p-6 bg-surface-container-lowest flex items-center justify-between border-b border-outline-variant/30">
            <span className="font-mono text-sm text-outline">Loading Order Dossier...</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 font-mono text-xs text-outline">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span>Fetching order and payment details...</span>
            </div>
          </div>
        </aside>
      </>
    );
  }

  const currency = order.currency || 'USD';
  const cancelEligibility = checkOrderCancellationEligibility(order);

  // Stepper state calculation
  const statusLevels = {
    awaiting_payment: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1
  };
  const currentLevel = statusLevels[order.orderStatus] ?? 0;

  // Next transition
  const nextTarget =
    order.orderStatus === 'confirmed'
      ? 'processing'
      : order.orderStatus === 'processing'
      ? 'shipped'
      : order.orderStatus === 'shipped'
      ? 'delivered'
      : null;

  const nextTransitionCheck = nextTarget
    ? checkOrderTransitionEligibility(order, nextTarget)
    : { allowed: false };

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-drawer-title"
        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface-container-low shadow-2xl z-50 flex flex-col border-l border-outline-variant/30"
      >
        {/* Header of Drawer */}
        <div className="p-6 bg-surface-container-lowest flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h2 id="order-drawer-title" className="font-mono text-lg font-bold text-primary">
                {order.orderReference}
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded uppercase font-bold bg-primary-container text-on-primary-container">
                {order.orderStatus}
              </span>
            </div>
            <span className="font-mono text-[11px] text-outline mt-1">
              Created: {formatDateTime(order.createdAt)} ({formatRelativeTime(order.createdAt)})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Close Drawer"
            aria-label="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Enforced Fulfillment Stepper */}
        {order.orderStatus !== 'cancelled' ? (
          <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
                Enforced Fulfillment Lifecycle
              </span>
              <span className="font-mono text-[11px] text-outline">
                {order.orderStatus === 'delivered' ? 'COMPLETED' : 'IN PROGRESS'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
              {/* Step 1: Confirmed */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentLevel >= 1
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-outline'
                  }`}
                >
                  1
                </div>
                <span className={currentLevel >= 1 ? 'text-primary font-bold' : 'text-outline'}>
                  CONFIRMED
                </span>
              </div>

              {/* Step 2: Processing */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentLevel >= 2
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-outline'
                  }`}
                >
                  2
                </div>
                <span className={currentLevel >= 2 ? 'text-primary font-bold' : 'text-outline'}>
                  PROCESSING
                </span>
              </div>

              {/* Step 3: Shipped */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentLevel >= 3
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-outline'
                  }`}
                >
                  3
                </div>
                <span className={currentLevel >= 3 ? 'text-primary font-bold' : 'text-outline'}>
                  SHIPPED
                </span>
              </div>

              {/* Step 4: Delivered */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentLevel >= 4
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container-highest text-outline'
                  }`}
                >
                  4
                </div>
                <span className={currentLevel >= 4 ? 'text-secondary font-bold' : 'text-outline'}>
                  DELIVERED
                </span>
              </div>
            </div>

            {/* Stepper Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
              {cancelEligibility.cancellable ? (
                <button
                  type="button"
                  onClick={() => onCancelOrder(order)}
                  className="px-3 py-1.5 bg-error-container text-on-error-container hover:bg-error hover:text-on-error rounded font-headline text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>
              ) : (
                <div />
              )}

              {nextTarget && nextTransitionCheck.allowed && (
                <button
                  type="button"
                  onClick={() => onAdvanceStatus(order, nextTarget)}
                  className="px-4 py-1.5 bg-primary text-on-primary hover:opacity-90 rounded font-headline text-xs font-semibold transition-opacity flex items-center gap-1.5 shadow-sm"
                >
                  <span>
                    Advance to {nextTarget.charAt(0).toUpperCase() + nextTarget.slice(1)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-error-container/20 border border-error/40 space-y-1">
            <div className="flex items-center gap-2 text-error font-headline font-bold text-xs uppercase">
              <Ban className="w-4 h-4" />
              <span>Order Cancelled</span>
            </div>
            <p className="font-mono text-xs text-on-surface-variant">
              This order was cancelled on {formatDateTime(order.cancellation?.cancelledAt || order.updatedAt)}.
              {order.cancellation?.reason && ` Reason: "${order.cancellation.reason}".`}
            </p>
          </div>
        )}

        {/* Carrier Tracking Banner if Shipped */}
        {order.tracking?.trackingNumber && (
          <div className="p-4 rounded-xl bg-primary-container/15 border border-primary/30 flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <span className="font-bold text-on-surface block">
                  Carrier: {order.tracking.carrier}
                </span>
                <span className="text-outline">Tracking #: {order.tracking.trackingNumber}</span>
              </div>
            </div>
            {order.tracking.trackingUrl && (
              <a
                href={order.tracking.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-primary text-on-primary rounded font-headline text-xs font-semibold hover:opacity-90 flex items-center gap-1.5"
              >
                <span>Track Parcel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Ordered Items Table (Manifest) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              Manifest Contents ({order.items?.length || 0} items)
            </span>
            <span className="font-mono text-[11px] text-outline">
              IMMUTABLE SNAPSHOT
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container font-mono text-[11px] text-outline uppercase border-b border-outline-variant/30">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-mono text-xs text-on-surface">
                {order.items?.map((item, idx) => (
                  <tr key={item._id || item.sku || idx} className="hover:bg-surface-container/40">
                    <td className="py-3 px-3">
                      <span className="font-headline font-semibold text-xs text-on-surface block">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-primary font-semibold">
                      {item.sku}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-outline">
                      {formatCurrency(item.unitPriceCents, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-on-surface">
                      {formatCurrency(item.lineTotalCents, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Destination & Financial Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Destination Dossier */}
          <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
                  Destination Dossier
                </span>
                <MapPin className="w-4 h-4 text-outline" />
              </div>
              <span className="font-headline font-bold text-sm text-on-surface block">
                {order.shippingAddress?.recipientName}
              </span>
              <p className="font-mono text-xs text-on-surface-variant mt-1 leading-relaxed">
                {order.shippingAddress?.streetAddress1}
                {order.shippingAddress?.streetAddress2 && `, ${order.shippingAddress.streetAddress2}`}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.postalCode}
                <br />
                {order.shippingAddress?.country}
              </p>
            </div>
            <div className="font-mono text-[11px] text-outline border-t border-outline-variant/20 pt-2">
              TEL: {order.shippingAddress?.phone || '—'}
            </div>
          </div>

          {/* Monetary Ledger */}
          <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
                Monetary Ledger
              </span>
              <span className="font-mono text-[11px] text-outline">
                {currency}
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="text-on-surface font-medium">
                  {formatCurrency(order.subtotalCents, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="text-on-surface font-medium">
                  {formatCurrency(order.shippingCents, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax:</span>
                <span className="text-on-surface font-medium">
                  {formatCurrency(order.taxCents, currency)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-outline-variant/30 text-on-surface">
                <span className="font-headline font-bold text-xs uppercase">Grand Total Due:</span>
                <span className="font-headline font-bold text-base text-primary">
                  {formatCurrency(order.totalCents, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Dossier */}
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              Customer Account
            </span>
            <User className="w-4 h-4 text-outline" />
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div>
              <span className="text-outline text-[11px] block">NAME:</span>
              <span className="text-on-surface font-semibold">
                {order.customer
                  ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || '—'
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-outline text-[11px] block">EMAIL:</span>
              <span className="text-on-surface font-semibold">
                {order.customer?.email || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Snapshot */}
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
              Payment Record
            </span>
            <CreditCard className="w-4 h-4 text-outline" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded bg-surface-container-lowest">
              <span className="text-outline text-[10px] block">PROVIDER</span>
              <span className="font-bold text-on-surface uppercase">
                {payment?.provider || order.paymentMethod}
              </span>
            </div>
            <div className="p-2.5 rounded bg-surface-container-lowest">
              <span className="text-outline text-[10px] block">STATUS</span>
              <span
                className={`font-bold uppercase ${
                  order.paymentStatus === 'paid' ? 'text-secondary' : 'text-tertiary'
                }`}
              >
                {payment?.status || order.paymentStatus}
              </span>
            </div>
            <div className="p-2.5 rounded bg-surface-container-lowest">
              <span className="text-outline text-[10px] block">AMOUNT</span>
              <span className="font-bold text-on-surface">
                {formatCurrency(payment?.amountCents ?? order.totalCents, currency)}
              </span>
            </div>
          </div>

          {payment?.providerPaymentId && (
            <div className="font-mono text-[11px] text-outline">
              PROVIDER REF: <span className="text-on-surface">{payment.providerPaymentId}</span>
            </div>
          )}

          {payment?.failureReason && (
            <div className="p-2 rounded bg-error-container/20 border border-error/30 text-error font-mono text-xs">
              Failure: {payment.failureReason}
            </div>
          )}
        </div>

        {/* Order Audit Timeline */}
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold block">
            Administrative Audit History ({auditLogs.length} events)
          </span>
          <OrderTimeline auditLogs={auditLogs} />
        </div>
      </div>
    </aside>
    </>
  );
}

