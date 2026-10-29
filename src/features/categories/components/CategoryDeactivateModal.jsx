import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { AlertTriangle, X } from 'lucide-react';

export function CategoryDeactivateModal({ isOpen, onClose, category, onConfirm }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !category) return null;

  const handleDeactivate = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await onConfirm(category._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to deactivate category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-lowest border border-error/40 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-error-container/20 border border-error/30 flex items-center justify-center text-error">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-outline hover:text-on-surface rounded hover:bg-surface-container transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
            Deactivate Category "{category.name}"?
          </h3>

          <p className="font-body text-xs text-outline leading-relaxed mb-4">
            This action executes a <strong className="text-on-surface">soft deactivation</strong> (toggles <code>isActive: false</code>). The category will no longer appear in public navigation or active product selectors, and assigned products cannot be published while the category remains inactive.
          </p>

          <div className="p-3 bg-surface-container-low rounded border border-outline-variant/30 mb-4 font-mono text-[11px] text-outline">
            <div>NAME: <span className="text-on-surface font-bold">{category.name}</span></div>
            <div>SLUG: <span className="text-on-surface">{category.slug}</span></div>
            <div>ID: <span className="text-on-surface">{category._id}</span></div>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-error-container/20 border border-error/30 text-xs font-mono text-error mb-4">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleDeactivate}
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

