import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Layers, X, AlertCircle } from 'lucide-react';

export function ProductStatusModal({ isOpen, onClose, product, onUpdateStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(product?.status || 'draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (product) {
      setSelectedStatus(product.status || 'draft');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStatus === product.status) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onUpdateStatus(product._id, selectedStatus);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update product status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-status-modal-title"
        className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary border border-outline-variant/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 id="product-status-modal-title" className="font-headline font-bold text-base text-on-surface">
                Update Product Lifecycle Status
              </h3>
              <p className="font-mono text-[11px] text-outline">
                SKU: {product.sku}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface rounded hover:bg-surface-container transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-error-container/20 border border-error/30 text-xs font-mono text-error flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-2">
              Select Lifecycle Status
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'draft',
                  title: 'Draft',
                  desc: 'Hidden from customer storefront, editable by admins'
                },
                {
                  id: 'published',
                  title: 'Published',
                  desc: 'Visible in customer catalog (requires active category)'
                },
                {
                  id: 'archived',
                  title: 'Archived',
                  desc: 'Retired SKU, unavailable for purchase or checkout'
                }
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                    selectedStatus === opt.id
                      ? 'bg-surface-container border-primary'
                      : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="productStatusOpt"
                    value={opt.id}
                    checked={selectedStatus === opt.id}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mt-0.5 text-primary focus:ring-0"
                  />
                  <div>
                    <span className="font-headline font-bold text-xs text-on-surface block">
                      {opt.title}
                    </span>
                    <span className="font-body text-[11px] text-outline block mt-0.5">
                      {opt.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
              Apply Status
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

