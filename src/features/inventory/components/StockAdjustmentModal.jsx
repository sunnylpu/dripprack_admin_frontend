import React, { useState, useEffect, useMemo } from 'react';
import {
  validateStockAdjustment,
  generateIdempotencyKey
} from '../inventoryValidation.js';
import {
  SlidersHorizontal,
  PlusCircle,
  MinusCircle,
  Lock,
  RotateCw,
  X,
  AlertTriangle,
  CheckCircle2,
  Package
} from 'lucide-react';

const STANDARD_REASONS = [
  'Supplier batch restock received at warehouse facility',
  'Physical cycle count inventory reconciliation',
  'Defective / damaged item removed from shelf',
  'Transit damage flagged during pick-pack verification',
  'Inventory shrinkage / discrepancy adjustment',
  'Approved customer return re-shelved to inventory'
];

export function StockAdjustmentModal({
  isOpen,
  onClose,
  product,
  availableProducts = [],
  onSubmit,
  isSubmitting = false
}) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [mode, setMode] = useState('add'); // 'add' | 'sub'
  const [deltaInput, setDeltaInput] = useState('10');
  const [reason, setReason] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState(null);

  // Active product record
  const currentProduct = useMemo(() => {
    if (product) return product;
    return availableProducts.find((p) => p._id === selectedProductId) || null;
  }, [product, availableProducts, selectedProductId]);

  // Reset or initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode('add');
      setDeltaInput('10');
      setReason('');
      setValidationError('');
      setApiError(null);
      setIdempotencyKey(generateIdempotencyKey());

      if (product) {
        setSelectedProductId(product._id);
      } else if (availableProducts.length > 0) {
        setSelectedProductId(availableProducts[0]._id);
      }
    }
  }, [isOpen, product, availableProducts]);

  if (!isOpen) return null;

  const physical = currentProduct?.stock?.physical ?? 0;
  const reserved = currentProduct?.stock?.reserved ?? 0;
  const available = currentProduct?.stock?.available ?? 0;

  const parsedMagnitude = Math.abs(parseInt(deltaInput, 10)) || 0;
  const signedDelta = mode === 'add' ? parsedMagnitude : -parsedMagnitude;

  const projectedPhysical = physical + signedDelta;
  const projectedAvailable = available + signedDelta;

  const isDeductionExcessive = mode === 'sub' && parsedMagnitude > available;

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setValidationError('');
    setApiError(null);
  };

  const handleRegenerateKey = () => {
    setIdempotencyKey(generateIdempotencyKey());
  };

  const handleQuickReason = (tag) => {
    setReason(tag);
    setValidationError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError(null);

    if (!currentProduct?._id) {
      setValidationError('Please select a target product for stock adjustment.');
      return;
    }

    const { isValid, errors, parsedPayload } = validateStockAdjustment({
      productId: currentProduct._id,
      quantityDelta: signedDelta,
      reason,
      availableStock: available
    });

    if (!isValid) {
      const firstError = Object.values(errors)[0];
      setValidationError(firstError);
      return;
    }

    try {
      await onSubmit(parsedPayload, idempotencyKey);
    } catch (err) {
      setApiError(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-xl p-6 space-y-4 relative overflow-hidden shadow-2xl border border-outline-variant/30 my-8">
        {/* Top Gradient Idempotency Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-on-primary-container" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface uppercase tracking-wide">
                Stock Adjustment Terminal
              </h3>
              <span className="font-mono text-[10px] text-outline tracking-wider block">
                ATOMIC INVENTORY MODIFIER // V2.4
              </span>
            </div>
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

        {/* Server or Client Error Alert */}
        {(validationError || apiError) && (
          <div className="p-3 rounded-lg bg-error-container/20 border border-error/40 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
            <div className="text-xs font-mono text-error">
              {validationError || apiError?.message || 'An error occurred during adjustment'}
            </div>
          </div>
        )}

        {/* Target Product Summary Card */}
        {product ? (
          <div className="bg-surface-container-low p-3.5 rounded-lg space-y-2 border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-headline font-semibold text-sm text-on-surface truncate">
                {product.name}
              </span>
              <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-semibold">
                {product.sku}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-surface-container p-2 rounded">
                <span className="text-[10px] text-outline block">CURRENT PHYSICAL</span>
                <span className="font-bold text-sm text-on-surface">{physical}</span>
              </div>
              <div className="bg-surface-container p-2 rounded">
                <span className="text-[10px] text-outline block">RESERVED IN CARTS</span>
                <span className="font-bold text-sm text-tertiary">{reserved}</span>
              </div>
              <div className="bg-surface-container p-2 rounded">
                <span className="text-[10px] text-outline block">NET AVAILABLE</span>
                <span className="font-bold text-sm text-secondary">{available}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase text-on-surface-variant font-medium">
              Target Product &amp; SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-surface-container font-mono text-xs text-on-surface p-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
            >
              {availableProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.sku} — {p.name} (Avail: {p.stock?.available ?? 0})
                </option>
              ))}
            </select>
            {currentProduct && (
              <div className="grid grid-cols-3 gap-2 text-center font-mono pt-1">
                <div className="bg-surface-container p-2 rounded">
                  <span className="text-[10px] text-outline block">PHYSICAL</span>
                  <span className="font-bold text-xs text-on-surface">{physical}</span>
                </div>
                <div className="bg-surface-container p-2 rounded">
                  <span className="text-[10px] text-outline block">RESERVED</span>
                  <span className="font-bold text-xs text-tertiary">{reserved}</span>
                </div>
                <div className="bg-surface-container p-2 rounded">
                  <span className="text-[10px] text-outline block">AVAILABLE</span>
                  <span className="font-bold text-xs text-secondary">{available}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Step 1: Direction Toggle */}
          <div className="space-y-1.5">
            <label className="font-mono text-xs uppercase text-on-surface-variant font-medium">
              1. Select Movement Direction
            </label>
            <div className="grid grid-cols-2 gap-2 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
              <button
                type="button"
                onClick={() => handleModeChange('add')}
                className={`py-2 px-3 rounded font-headline text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'add'
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>Add Stock (Restock)</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('sub')}
                className={`py-2 px-3 rounded font-headline text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'sub'
                    ? 'bg-error-container text-on-error-container shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <MinusCircle className="w-4 h-4 text-error" />
                <span>Remove (Damage/Loss)</span>
              </button>
            </div>
          </div>

          {/* Step 2: Quantity Delta */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs uppercase text-on-surface-variant font-medium">
                2. Quantity Delta
              </label>
              <span
                className={`font-mono text-[11px] ${
                  isDeductionExcessive ? 'text-error font-bold' : 'text-outline'
                }`}
              >
                {mode === 'add'
                  ? 'Uncapped Inbound Intake'
                  : `Max Available to Deduct: ${available} units`}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2 border transition-colors ${
                isDeductionExcessive
                  ? 'border-error'
                  : 'border-outline-variant/30 focus-within:border-primary'
              }`}
            >
              <span
                className={`font-mono text-xl font-bold ${
                  mode === 'add' ? 'text-secondary' : 'text-error'
                }`}
              >
                {mode === 'add' ? '+' : '-'}
              </span>
              <input
                type="number"
                min="1"
                max="100000"
                step="1"
                value={deltaInput}
                onChange={(e) => setDeltaInput(e.target.value)}
                placeholder="Enter units (e.g. 25)"
                className="bg-transparent font-mono text-lg font-bold text-on-surface w-full focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-semibold">UNITS</span>
            </div>
            {isDeductionExcessive && (
              <p className="font-mono text-xs text-error">
                Warning: Reduction ({parsedMagnitude}) cannot exceed available stock ({available}).
              </p>
            )}
          </div>

          {/* Step 3: Projected Calculations */}
          <div className="bg-surface-container-high/60 p-3 rounded-lg border border-outline-variant/20 font-mono text-xs space-y-1">
            <div className="flex items-center justify-between text-outline">
              <span>PROJECTED PHYSICAL UNITS:</span>
              <span
                className={`font-bold ${
                  projectedPhysical < 0 ? 'text-error' : 'text-on-surface'
                }`}
              >
                {physical} {mode === 'add' ? '+' : '-'} {parsedMagnitude} &rarr;{' '}
                {projectedPhysical} Units
              </span>
            </div>
            <div className="flex items-center justify-between text-outline">
              <span>PROJECTED NET AVAILABLE:</span>
              <span
                className={`font-bold ${
                  projectedAvailable < 0 ? 'text-error' : 'text-secondary'
                }`}
              >
                {available} {mode === 'add' ? '+' : '-'} {parsedMagnitude} &rarr;{' '}
                {projectedAvailable} Units
              </span>
            </div>
          </div>

          {/* Step 4: Audit Reason Textarea & Helper Tags */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs uppercase text-on-surface-variant font-medium">
                3. Audit Reason &amp; Reference
              </label>
              <span className="font-mono text-[10px] text-error font-bold">*MANDATORY (3-500 CHARS)</span>
            </div>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Supplier batch restock received from manufacturer"
              className="w-full bg-surface-container font-mono text-xs text-on-surface p-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline-variant"
            />
            {/* Helper Tags */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {STANDARD_REASONS.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickReason(r)}
                  className="font-mono text-[10px] bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface px-2 py-0.5 rounded border border-outline-variant/20 transition-colors"
                >
                  +{r.split(' ').slice(0, 3).join(' ')}...
                </button>
              ))}
            </div>
          </div>

          {/* Idempotency Lock Indicator */}
          <div className="bg-surface-container p-2.5 rounded-lg flex items-center justify-between text-outline font-mono text-xs border border-outline-variant/20">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-secondary" />
              <span>Idempotency Lock Active:</span>
              <span className="text-on-surface-variant font-semibold">
                {idempotencyKey.slice(0, 18)}...
              </span>
            </div>
            <button
              type="button"
              onClick={handleRegenerateKey}
              className="p-1 text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
              title="Regenerate Idempotency Key"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-headline text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                parsedMagnitude <= 0 ||
                isDeductionExcessive ||
                reason.trim().length < 3
              }
              className="px-5 py-2 rounded-lg bg-primary text-on-primary font-headline text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Committing Adjustment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commit Stock Adjustment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
