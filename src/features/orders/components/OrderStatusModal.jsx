import React, { useState, useEffect } from 'react';
import { validateTracking } from '../orderValidation.js';
import { formatCurrency } from '../../../lib/formatters.js';
import {
  Truck,
  CheckCircle2,
  RefreshCw,
  X,
  AlertTriangle,
  Lock,
  DollarSign
} from 'lucide-react';

export function OrderStatusModal({
  isOpen,
  onClose,
  order,
  targetStatus,
  onConfirm,
  isSubmitting = false
}) {
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [codPaymentCollected, setCodPaymentCollected] = useState(false);
  const [trackingErrors, setTrackingErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  // Reset or initialize state
  useEffect(() => {
    if (isOpen) {
      setCarrier('');
      setTrackingNumber('');
      setTrackingUrl('');
      setCodPaymentCollected(false);
      setTrackingErrors({});
      setGeneralError('');
    }
  }, [isOpen, targetStatus, order]);

  if (!isOpen || !order || !targetStatus) return null;

  const isCODDue = order.paymentMethod === 'cod' && order.paymentStatus === 'cod_due';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTrackingErrors({});
    setGeneralError('');

    const payload = { status: targetStatus };

    // Transition: shipped
    if (targetStatus === 'shipped') {
      const { isValid, errors, parsedPayload } = validateTracking({
        carrier,
        trackingNumber,
        trackingUrl
      });

      if (!isValid) {
        setTrackingErrors(errors);
        return;
      }

      payload.tracking = parsedPayload;
    }

    // Transition: delivered
    if (targetStatus === 'delivered') {
      if (isCODDue) {
        if (!codPaymentCollected) {
          setGeneralError('You must explicitly confirm that the COD payment has been collected.');
          return;
        }
        payload.codPaymentCollected = true;
      }
    }

    try {
      await onConfirm(order.orderReference, payload);
    } catch (err) {
      setGeneralError(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-status-modal-title"
        className="w-full max-w-lg bg-surface-container-low p-6 rounded-xl shadow-2xl border border-outline-variant/30 flex flex-col gap-4 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            {targetStatus === 'shipped' ? (
              <Truck className="w-5 h-5 text-primary" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-secondary" />
            )}
            <h2 id="order-status-modal-title" className="font-headline font-bold text-base text-on-surface uppercase tracking-wide">
              {targetStatus === 'processing' && 'Advance to Processing'}
              {targetStatus === 'shipped' && 'Lock Carrier & Dispatch Order'}
              {targetStatus === 'delivered' && 'Confirm Order Delivery'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {generalError && (
          <div className="p-3 rounded-lg bg-error-container/20 border border-error/40 flex items-start gap-2 text-xs font-mono text-error">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Order Reference Notice */}
        <div className="p-3 rounded-lg bg-surface-container-lowest font-mono text-xs border border-outline-variant/20 flex items-center justify-between">
          <span className="text-outline">TARGET ORDER:</span>
          <span className="font-bold text-primary">{order.orderReference}</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Transition: Processing */}
          {targetStatus === 'processing' && (
            <div className="space-y-2 text-xs text-on-surface-variant font-mono">
              <p>
                Order status will advance from{' '}
                <span className="text-primary font-bold">confirmed</span> to{' '}
                <span className="text-tertiary font-bold">processing</span>.
              </p>
              <p className="text-outline">
                This signals the warehouse crew to pick items from shelves and pack the parcel.
              </p>
            </div>
          )}

          {/* Transition: Shipped (Carrier tracking form) */}
          {targetStatus === 'shipped' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded bg-primary-container/10 border border-primary/20 text-xs font-mono text-on-surface-variant">
                Advancing to <span className="font-bold text-primary">SHIPPED</span> commits
                reserved warehouse inventory as sold and generates sale movement records.
              </div>

              {/* Carrier Input */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">
                  Shipping Carrier
                </label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. FedEx Express, DHL, UPS"
                  className={`w-full bg-surface-container-lowest text-on-surface font-mono text-xs px-3 py-2 rounded-lg border focus:outline-none ${
                    trackingErrors.carrier
                      ? 'border-error'
                      : 'border-outline-variant/30 focus:border-primary'
                  }`}
                />
                {trackingErrors.carrier && (
                  <span className="font-mono text-[11px] text-error">
                    {trackingErrors.carrier}
                  </span>
                )}
              </div>

              {/* Tracking Number Input */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 784910294821"
                  className={`w-full bg-surface-container-lowest text-on-surface font-mono text-xs px-3 py-2 rounded-lg border focus:outline-none ${
                    trackingErrors.trackingNumber
                      ? 'border-error'
                      : 'border-outline-variant/30 focus:border-primary'
                  }`}
                />
                {trackingErrors.trackingNumber && (
                  <span className="font-mono text-[11px] text-error">
                    {trackingErrors.trackingNumber}
                  </span>
                )}
              </div>

              {/* Tracking URL Input (HTTPS only) */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase text-outline">
                  Carrier Tracking URL (HTTPS Required)
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://carrier.com/track/784910294821"
                  className={`w-full bg-surface-container-lowest text-on-surface font-mono text-xs px-3 py-2 rounded-lg border focus:outline-none ${
                    trackingErrors.trackingUrl
                      ? 'border-error'
                      : 'border-outline-variant/30 focus:border-primary'
                  }`}
                />
                {trackingErrors.trackingUrl && (
                  <span className="font-mono text-[11px] text-error">
                    {trackingErrors.trackingUrl}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Transition: Delivered (COD confirmation if applicable) */}
          {targetStatus === 'delivered' && (
            <div className="space-y-3">
              <div className="space-y-1 text-xs text-on-surface-variant font-mono">
                <p>
                  Order status will transition to{' '}
                  <span className="text-secondary font-bold">DELIVERED</span>.
                </p>
                <p className="text-outline">
                  This completes the fulfillment lifecycle. Delivered orders are terminal.
                </p>
              </div>

              {isCODDue && (
                <div className="p-3.5 rounded-lg bg-tertiary-container/15 border border-tertiary/30 space-y-2">
                  <div className="flex items-center gap-2 text-tertiary font-headline font-bold text-xs uppercase">
                    <DollarSign className="w-4 h-4" />
                    <span>COD Payment Collection Required</span>
                  </div>
                  <p className="font-mono text-xs text-on-surface-variant">
                    This order has pending Cash On Delivery collection of{' '}
                    <strong className="text-on-surface">
                      {formatCurrency(order.totalCents, order.currency)}
                    </strong>
                    . You must confirm receipt of payment from the courier before completing delivery.
                  </p>
                  <label className="flex items-start gap-2.5 p-2.5 bg-surface-container-lowest rounded-lg cursor-pointer border border-outline-variant/30">
                    <input
                      type="checkbox"
                      checked={codPaymentCollected}
                      onChange={(e) => setCodPaymentCollected(e.target.checked)}
                      className="accent-secondary rounded w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-on-surface font-medium">
                      Confirm Courier Remittance:{' '}
                      {formatCurrency(order.totalCents, order.currency)} collected in full
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-headline text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (targetStatus === 'delivered' && isCODDue && !codPaymentCollected)}
              className="px-5 py-2 bg-primary text-on-primary rounded-lg font-headline text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {targetStatus === 'processing' && 'Confirm Processing'}
                    {targetStatus === 'shipped' && 'Confirm Shipment'}
                    {targetStatus === 'delivered' && 'Confirm Delivery'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

