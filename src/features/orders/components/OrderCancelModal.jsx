import React, { useState, useEffect } from 'react';
import { validateCancelReason } from '../orderValidation.js';
import {
  Ban,
  AlertTriangle,
  RefreshCw,
  X,
  ShieldAlert,
  Info
} from 'lucide-react';

export function OrderCancelModal({
  isOpen,
  onClose,
  order,
  onConfirm,
  isSubmitting = false
}) {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setValidationError('');
      setApiError('');
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    const { isValid, error, parsedReason } = validateCancelReason(reason);
    if (!isValid) {
      setValidationError(error);
      return;
    }

    try {
      await onConfirm(order.orderReference, { reason: parsedReason });
    } catch (err) {
      setApiError(err.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-surface-container-low p-6 rounded-xl shadow-2xl border border-error/40 flex flex-col gap-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <Ban className="w-5 h-5 text-error" />
            <h2 className="font-headline font-bold text-base text-on-surface uppercase tracking-wide">
              Cancel Order &amp; Release Inventory
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server / Validation Error */}
        {(validationError || apiError) && (
          <div className="p-3 rounded-lg bg-error-container/20 border border-error/40 flex items-start gap-2 text-xs font-mono text-error">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{validationError || apiError}</span>
          </div>
        )}

        {/* Order Reference Notice */}
        <div className="p-3 rounded-lg bg-surface-container-lowest font-mono text-xs border border-outline-variant/20 flex items-center justify-between">
          <span className="text-outline">TARGET ORDER:</span>
          <span className="font-bold text-primary">{order.orderReference}</span>
        </div>

        {/* Policy Warning Banner */}
        <div className="p-3 bg-error-container/15 border border-error/30 rounded-lg space-y-1">
          <div className="flex items-center gap-1.5 text-error font-headline font-bold text-xs uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>Administrative Cancellation Policy</span>
          </div>
          <p className="font-mono text-xs text-on-surface-variant">
            Permitted for orders in <code className="text-primary font-bold">awaiting_payment</code>,{' '}
            <code className="text-primary font-bold">confirmed</code>, or{' '}
            <code className="text-primary font-bold">processing</code> status.
          </p>
          <p className="font-mono text-xs text-outline pt-1">
            Executing cancellation triggers an automatic inventory restoration (
            <span className="text-secondary font-bold">movementType: &apos;release&apos;</span>).
            This action cannot be undone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-outline">
              Audit Reason (3–500 characters, optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setValidationError('');
                setApiError('');
              }}
              placeholder="e.g. Customer requested immediate cancellation prior to parcel dispatch"
              className="w-full bg-surface-container-lowest text-on-surface font-mono text-xs p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-error placeholder:text-outline-variant"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-headline text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-error text-on-error rounded-lg font-headline text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  <span>Confirm Cancellation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
