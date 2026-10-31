import React, { useState, useEffect } from 'react';
import { validateProductForm } from '../productValidation.js';
import { categoryApi } from '../../categories/categoryApi.js';
import { formatCentsToDecimalInput } from '../../../lib/formatters.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Layers,
  Info
} from 'lucide-react';

export function ProductFormDrawer({ isOpen, onClose, productToEdit, onSave }) {
  const isEditing = Boolean(productToEdit?._id);

  // Form states
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Categories state
  const [activeCategories, setActiveCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Feedback states
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load active categories for dropdown
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingCategories(true);
    categoryApi
      .getActiveCategories()
      .then((cats) => {
        if (isMounted) {
          setActiveCategories(cats || []);
        }
      })
      .catch(() => {
        // Fallback: categories error
      })
      .finally(() => {
        if (isMounted) setIsLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Populate form if editing
  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku || '');
      setName(productToEdit.name || '');
      setSlug(productToEdit.slug || '');
      const catId = typeof productToEdit.category === 'object' && productToEdit.category !== null
        ? productToEdit.category._id
        : productToEdit.category || '';
      setCategory(catId);
      setPrice(formatCentsToDecimalInput(productToEdit.priceCents));
      setCompareAtPrice(
        productToEdit.compareAtPriceCents !== null && productToEdit.compareAtPriceCents !== undefined
          ? formatCentsToDecimalInput(productToEdit.compareAtPriceCents)
          : ''
      );
      setSize(productToEdit.attributes?.size || '');
      setColor(productToEdit.attributes?.color || '');
      setDescription(productToEdit.description || '');
      setStatus(productToEdit.status || 'draft');
      setLowStockThreshold(productToEdit.lowStockThreshold ?? 5);
      setImages(Array.isArray(productToEdit.images) ? [...productToEdit.images] : []);
    } else {
      setSku('');
      setName('');
      setSlug('');
      setCategory('');
      setPrice('');
      setCompareAtPrice('');
      setSize('');
      setColor('');
      setDescription('');
      setStatus('draft');
      setLowStockThreshold(5);
      setImages([]);
    }
    setNewImageUrl('');
    setFieldErrors({});
    setServerError('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('https://')) {
      setFieldErrors((prev) => ({ ...prev, images: 'Image URL must use secure HTTPS protocol' }));
      return;
    }

    if (images.length >= 10) {
      setFieldErrors((prev) => ({ ...prev, images: 'Maximum of 10 image URLs allowed per product' }));
      return;
    }

    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl('');
    setFieldErrors((prev) => ({ ...prev, images: undefined }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (isSubmitting) return;

    const { isValid, errors, parsedPayload } = validateProductForm(
      {
        sku,
        name,
        slug,
        category,
        price,
        compareAtPrice,
        size,
        color,
        description,
        status,
        lowStockThreshold,
        images
      },
      isEditing
    );

    if (!isValid) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(parsedPayload, productToEdit?._id);
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save product. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-background/80 backdrop-blur-sm flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-drawer-title"
        className="w-full max-w-2xl bg-surface-container-lowest border-l border-outline-variant/30 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="h-16 px-6 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary border border-outline-variant/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 id="product-drawer-title" className="font-headline font-bold text-base text-on-surface">
                {isEditing ? 'Edit Product Catalog' : 'Create New Product'}
              </h3>
              <p className="font-mono text-[11px] text-outline">
                {isEditing ? `SKU: ${productToEdit.sku}` : 'INTEGER-CENTS & HTTPS ASSETS STRICT'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface rounded hover:bg-surface-container transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-error-container/20 border border-error/30 flex items-start gap-2.5 text-xs font-mono text-error shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* SRS Invariant Notice: Stock is initialized to 0 */}
          {!isEditing && (
            <div className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-lg flex items-start gap-2.5 text-xs font-body text-outline">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-on-surface">Initial Inventory Notice:</strong> New products are created with 0 physical stock. Initial warehouse stock receipts are recorded in Phase 4 via Inventory Adjustments with audit reasons.
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs text-primary uppercase tracking-wider font-semibold">
              Product Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="SKU Identifier"
                required={!isEditing}
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value.toUpperCase());
                  if (fieldErrors.sku) setFieldErrors((prev) => ({ ...prev, sku: undefined }));
                }}
                placeholder="e.g. DRIP-HOODIE-BLK-M"
                error={fieldErrors.sku}
                helperText="Uppercase alphanumeric with hyphens (3–50 chars)"
              />

              <Input
                label="Product Name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Cyberpunk Oversized Acid Hoodie"
                error={fieldErrors.name}
                helperText="2 to 200 characters"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="URL Slug (Optional)"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase());
                  if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: undefined }));
                }}
                placeholder="e.g. cyberpunk-oversized-acid-hoodie"
                error={fieldErrors.slug}
                helperText="Leave empty to auto-generate from name"
              />

              <div>
                <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">
                  Category <span className="text-error">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  className={`w-full h-10 px-3 rounded bg-surface-container-low border text-xs font-body text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer ${
                    fieldErrors.category ? 'border-error' : 'border-outline-variant/30'
                  }`}
                >
                  <option value="">Select an active category...</option>
                  {activeCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <span className="font-mono text-xs text-error mt-1 block">
                    {fieldErrors.category}
                  </span>
                )}
                {activeCategories.length === 0 && !isLoadingCategories && (
                  <span className="font-mono text-[11px] text-tertiary mt-1 block">
                    No active categories found. Please create an active category first.
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">
                Description <span className="text-error">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: undefined }));
                }}
                placeholder="Detailed garment specifications, fabric weight, fit notes, and styling instructions..."
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
          </div>

          {/* Variant Specifications */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/20">
            <h4 className="font-mono text-xs text-primary uppercase tracking-wider font-semibold">
              Variant Attributes (V1 Autonomous SKU)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Size"
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                  if (fieldErrors.size) setFieldErrors((prev) => ({ ...prev, size: undefined }));
                }}
                placeholder="e.g. S, M, L, XL, 32/34"
                error={fieldErrors.size}
                helperText="Garment size specification"
              />

              <Input
                label="Color / Wash"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  if (fieldErrors.color) setFieldErrors((prev) => ({ ...prev, color: undefined }));
                }}
                placeholder="e.g. Vintage Black, Acid Wash"
                error={fieldErrors.color}
                helperText="Garment colorway or wash finish"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/20">
            <h4 className="font-mono text-xs text-primary uppercase tracking-wider font-semibold">
              Pricing Configuration
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Selling Price"
                required
                type="text"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: undefined }));
                }}
                placeholder="e.g. 149.99"
                error={fieldErrors.price}
                helperText="Enter decimal amount (converted to integer cents)"
              />

              <Input
                label="Compare-At Price (Optional)"
                type="text"
                value={compareAtPrice}
                onChange={(e) => {
                  setCompareAtPrice(e.target.value);
                  if (fieldErrors.compareAtPrice) setFieldErrors((prev) => ({ ...prev, compareAtPrice: undefined }));
                }}
                placeholder="e.g. 179.99"
                error={fieldErrors.compareAtPrice}
                helperText="Original MSRP; must be ≥ selling price"
              />
            </div>
          </div>

          {/* Image URLs Editor */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs text-primary uppercase tracking-wider font-semibold">
                Image Asset URLs (Max 10)
              </h4>
              <span className="font-mono text-[11px] text-outline">
                {images.length} / 10 ASSETS
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/images/item-front.jpg"
                className="flex-1 px-3 py-2 rounded bg-surface-container-low border border-outline-variant/30 text-xs font-mono text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddImage}
                disabled={images.length >= 10 || !newImageUrl.trim()}
                className="px-3 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded text-xs font-mono text-on-surface disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            {fieldErrors.images && (
              <span className="font-mono text-xs text-error block">
                {fieldErrors.images}
              </span>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-outline-variant/30 aspect-square bg-surface-container-low"
                  >
                    <img
                      src={imgUrl}
                      alt={`Product asset ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center p-2 text-center text-[10px] font-mono text-outline bg-surface-container">
                      Invalid Image
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded bg-background/80 text-error hover:bg-error hover:text-on-error transition-colors opacity-90 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-background/80 text-[10px] font-mono text-primary font-bold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lifecycle & Threshold Controls */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/20">
            <h4 className="font-mono text-xs text-primary uppercase tracking-wider font-semibold">
              Operational Settings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1">
                  Product Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded bg-surface-container-low border border-outline-variant/30 text-xs font-body text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="draft">Draft (Private in admin)</option>
                  <option value="published">Published (Visible in storefront)</option>
                  <option value="archived">Archived (Retired SKU)</option>
                </select>
                <span className="text-[11px] font-mono text-outline mt-1 block">
                  Category must be active to publish
                </span>
              </div>

              <Input
                label="Low Stock Threshold"
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="5"
                error={fieldErrors.lowStockThreshold}
                helperText="Triggers critical stock alert when available ≤ value"
              />
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="h-16 px-6 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-end gap-3 shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? 'Save Product Changes' : 'Create Product'}
          </Button>
        </div>
      </div>
    </div>
  );
}

