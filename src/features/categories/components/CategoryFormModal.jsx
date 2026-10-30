import React, { useState, useEffect } from 'react';
import { validateCategoryForm } from '../categoryValidation.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { X, FolderTree, AlertCircle } from 'lucide-react';

export function CategoryFormModal({ isOpen, onClose, categoryToEdit, onSave }) {
  const isEditing = Boolean(categoryToEdit?._id);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setSlug(categoryToEdit.slug || '');
      setDescription(categoryToEdit.description || '');
      setIsActive(typeof categoryToEdit.isActive === 'boolean' ? categoryToEdit.isActive : true);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIsActive(true);
    }
    setFieldErrors({});
    setServerError('');
  }, [categoryToEdit, isOpen]);

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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (isSubmitting) return;

    const { isValid, errors, parsedPayload } = validateCategoryForm(
      { name, slug, description, isActive },
      isEditing
    );

    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(parsedPayload, categoryToEdit?._id);
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save category. Please check your connection or inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary border border-outline-variant/30">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 id="category-modal-title" className="font-headline font-bold text-base text-on-surface">
                {isEditing ? 'Edit Category Taxonomy' : 'Create New Category'}
              </h3>
              <p className="font-mono text-[11px] text-outline">
                {isEditing ? `ID: ${categoryToEdit._id}` : 'STRICT SLUG & ACTIVE INVARIANT'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface rounded hover:bg-surface-container transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-error-container/20 border border-error/30 flex items-start gap-2.5 text-xs font-mono text-error">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Category Name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="e.g. Streetwear Tops"
            error={fieldErrors.name}
            helperText="2 to 60 characters"
          />

          <Input
            label="Category Slug (Optional)"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: undefined }));
            }}
            placeholder="e.g. streetwear-tops (generated automatically if left blank)"
            error={fieldErrors.slug}
            helperText="Lowercase alphanumeric characters and hyphens only"
          />

          <div>
            <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Provide context on product lines classified under this taxonomy node..."
              className={`w-full p-3 rounded bg-surface-container-low border text-xs font-body text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary transition-colors ${
                fieldErrors.description ? 'border-error' : 'border-outline-variant/30'
              }`}
            />
            {fieldErrors.description && (
              <span className="font-mono text-xs text-error mt-1 block">
                {fieldErrors.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActiveCategoryCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded bg-surface-container border-outline-variant/40 text-primary focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isActiveCategoryCheck" className="text-xs font-mono text-on-surface cursor-pointer select-none">
              Category Active in Catalog (Inactive categories hide linked products from public storefronts)
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

