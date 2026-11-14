import React, { useState, useEffect } from 'react';
import { X, Play, Eye, Film, Sparkles, Check, AlertCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { sectionApi } from './sectionApi.js';
import { categoryApi } from '../categories/categoryApi.js';
import { productApi } from '../products/productApi.js';

export function SectionEditDrawer({ isOpen, onClose, section, onSaved }) {
  const [formData, setFormData] = useState({
    sectionName: '',
    sortOrder: 1,
    placementNotice: '',
    isActive: true,
    media: {
      videoUrl: '',
      posterUrl: '',
      imageUrl: '',
      secondaryImageUrl: ''
    },
    content: {
      heading: '',
      subheading: '',
      caption: '',
      badge: ''
    },
    cta: {
      text: '',
      link: '',
      style: 'white'
    },
    curation: {
      category: '',
      products: [],
      modelSpecs: ''
    }
  });

  const [categories, setCategories] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [videoPreviewActive, setVideoPreviewActive] = useState(true);

  // Initialize form state when section changes
  useEffect(() => {
    if (section) {
      setFormData({
        sectionName: section.sectionName || '',
        sortOrder: section.sortOrder ?? 1,
        placementNotice: section.placementNotice || '',
        isActive: section.isActive ?? true,
        media: {
          videoUrl: section.media?.videoUrl || '',
          posterUrl: section.media?.posterUrl || '',
          imageUrl: section.media?.imageUrl || '',
          secondaryImageUrl: section.media?.secondaryImageUrl || ''
        },
        content: {
          heading: section.content?.heading || '',
          subheading: section.content?.subheading || '',
          caption: section.content?.caption || '',
          badge: section.content?.badge || ''
        },
        cta: {
          text: section.cta?.text || '',
          link: section.cta?.link || '',
          style: section.cta?.style || 'white'
        },
        curation: {
          category: section.curation?.category?._id || section.curation?.category || '',
          products: (section.curation?.products || []).map((p) => (typeof p === 'object' ? p._id : p)),
          modelSpecs: section.curation?.modelSpecs || ''
        }
      });
      setError(null);
    }
  }, [section]);

  // Load available categories and products for curation
  useEffect(() => {
    if (isOpen) {
      categoryApi.getActiveCategories().then((cats) => {
        setCategories(cats || []);
      }).catch(() => {});

      productApi.getAdminProducts({ limit: 50 }).then((res) => {
        setAvailableProducts(res?.products || res?.data || []);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !section) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        sectionName: formData.sectionName.trim(),
        sortOrder: Number(formData.sortOrder),
        placementNotice: formData.placementNotice.trim(),
        isActive: formData.isActive,
        media: {
          videoUrl: formData.media.videoUrl?.trim() || null,
          posterUrl: formData.media.posterUrl?.trim() || null,
          imageUrl: formData.media.imageUrl?.trim() || null,
          secondaryImageUrl: formData.media.secondaryImageUrl?.trim() || null
        },
        content: {
          heading: formData.content.heading?.trim() || null,
          subheading: formData.content.subheading?.trim() || null,
          caption: formData.content.caption?.trim() || null,
          badge: formData.content.badge?.trim() || null
        },
        cta: {
          text: formData.cta.text?.trim() || null,
          link: formData.cta.link?.trim() || null,
          style: formData.cta.style || 'white'
        },
        curation: {
          category: formData.curation.category || null,
          products: formData.curation.products || [],
          modelSpecs: formData.curation.modelSpecs?.trim() || null
        }
      };

      const updated = await sectionApi.updateSection(section._id, payload);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to update section. Please check URL formats and fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductSelection = (productId) => {
    setFormData((prev) => {
      const current = prev.curation.products;
      const exists = current.includes(productId);
      return {
        ...prev,
        curation: {
          ...prev.curation,
          products: exists ? current.filter((id) => id !== productId) : [...current, productId]
        }
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-surface-container-lowest border-l border-outline-variant/30 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-start justify-between bg-surface-container-low/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                ORDER #{String(formData.sortOrder).padStart(2, '0')}
              </span>
              <span className="font-mono text-xs text-outline uppercase tracking-wider">
                {section.sectionType}
              </span>
            </div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              {section.sectionName}
            </h2>
            <p className="font-mono text-xs text-outline mt-0.5">
              key: <code className="text-on-surface font-semibold">{section.sectionKey}</code>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storefront Location Notice Callout */}
        <div className="mx-6 mt-4 p-4 rounded-lg bg-surface-container border border-outline-variant/40 flex items-start gap-3">
          <div className="p-2 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
            <Film className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-headline font-bold uppercase tracking-wider text-on-surface block mb-0.5">
              Storefront Section Placement Notice
            </span>
            <p className="text-on-surface-variant font-body leading-relaxed">
              {section.placementNotice}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <a
                href={`http://localhost:5174/#${section.sectionKey}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline font-semibold"
              >
                <span>View on Live Storefront</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-error-container/20 border border-error/30 rounded text-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section Core Details */}
          <div className="space-y-4">
            <h3 className="font-headline text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20 pb-2">
              General Settings
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-mono text-outline mb-1">Section Display Name</label>
                <Input
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  placeholder="e.g. Hero Video Loop"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-outline mb-1">Sort Order</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
              <div>
                <span className="text-xs font-headline font-semibold text-on-surface block">
                  Storefront Visibility
                </span>
                <span className="text-[11px] text-outline">
                  Toggle whether this section renders on the client storefront.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Media & Video Streaming Controls */}
          <div className="space-y-4">
            <h3 className="font-headline text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20 pb-2 flex items-center justify-between">
              <span>Media & Video Streaming</span>
              {formData.media.videoUrl && (
                <span className="text-[10px] text-primary font-mono lowercase flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" /> Live Video Stream Active
                </span>
              )}
            </h3>

            <div>
              <label className="block text-xs font-mono text-outline mb-1">
                Ambient Video URL (.mp4 stream)
              </label>
              <Input
                value={formData.media.videoUrl}
                onChange={(e) => setFormData({
                  ...formData,
                  media: { ...formData.media, videoUrl: e.target.value }
                })}
                placeholder="https://.../video.mp4"
              />
              <span className="text-[11px] text-outline mt-1 block">
                Direct HTTPS URL to high-definition MP4 stream (plays automatically muted in a seamless loop).
              </span>
            </div>

            {/* Live Video Player Preview in Drawer */}
            {formData.media.videoUrl && (
              <div className="rounded-lg overflow-hidden border border-outline-variant/40 bg-black relative group">
                <video
                  key={formData.media.videoUrl}
                  src={formData.media.videoUrl}
                  poster={formData.media.posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full max-h-56 object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-white font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Video Preview Stream</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-outline mb-1">
                  Video Poster Fallback Image URL
                </label>
                <Input
                  value={formData.media.posterUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    media: { ...formData.media, posterUrl: e.target.value }
                  })}
                  placeholder="https://.../poster.jpg"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-outline mb-1">
                  Primary Editorial Image URL
                </label>
                <Input
                  value={formData.media.imageUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    media: { ...formData.media, imageUrl: e.target.value }
                  })}
                  placeholder="https://.../image.jpg"
                />
              </div>
            </div>

            {formData.media.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-outline-variant/40 bg-surface-container max-w-xs">
                <img
                  src={formData.media.imageUrl}
                  alt="Section preview"
                  className="w-full h-36 object-cover"
                />
              </div>
            )}
          </div>

          {/* Editorial Content */}
          <div className="space-y-4">
            <h3 className="font-headline text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20 pb-2">
              Editorial Typography & Copy
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-mono text-outline mb-1">Headline Text</label>
                <Input
                  value={formData.content.heading}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, heading: e.target.value }
                  })}
                  placeholder="e.g. FALL / WINTER 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-outline mb-1">Eyebrow / Badge</label>
                <Input
                  value={formData.content.badge}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, badge: e.target.value }
                  })}
                  placeholder="e.g. LOOK 01"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-outline mb-1">Subheading / Description</label>
              <textarea
                value={formData.content.subheading}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, subheading: e.target.value }
                })}
                rows={3}
                placeholder="Architectural drapery and raw Japanese denim engineered between Montreal and Seoul."
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg p-3 text-xs text-on-surface focus:outline-none focus:border-primary font-body"
              />
            </div>
          </div>

          {/* Call to Action (CTA) */}
          <div className="space-y-4">
            <h3 className="font-headline text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20 pb-2">
              Call To Action (CTA Button)
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-outline mb-1">Button Label</label>
                <Input
                  value={formData.cta.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    cta: { ...formData.cta, text: e.target.value }
                  })}
                  placeholder="e.g. SHOP NOW"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-mono text-outline mb-1">Target URL / Route</label>
                <Input
                  value={formData.cta.link}
                  onChange={(e) => setFormData({
                    ...formData,
                    cta: { ...formData.cta, link: e.target.value }
                  })}
                  placeholder="e.g. /shop or https://..."
                />
              </div>
            </div>
          </div>

          {/* Curation & Outfit Products */}
          {(section.sectionType === 'SHOP_THE_LOOK' ||
            section.sectionType === 'CAROUSEL' ||
            section.sectionType === 'PRODUCT_FEED') && (
            <div className="space-y-4">
              <h3 className="font-headline text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20 pb-2">
                Curated Products & Outfitting
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-outline mb-1">Category Link</label>
                  <select
                    value={formData.curation.category}
                    onChange={(e) => setFormData({
                      ...formData,
                      curation: { ...formData.curation, category: e.target.value }
                    })}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded-lg p-2.5 text-xs text-on-surface font-body"
                  >
                    <option value="">None (Custom Selection)</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-outline mb-1">Model Fit / Specs</label>
                  <Input
                    value={formData.curation.modelSpecs}
                    onChange={(e) => setFormData({
                      ...formData,
                      curation: { ...formData.curation, modelSpecs: e.target.value }
                    })}
                    placeholder="e.g. Uma is 5'5 wearing Size 1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-outline mb-2">
                  Select Products to Showcase ({formData.curation.products.length} selected)
                </label>
                <div className="max-h-52 overflow-y-auto space-y-1.5 p-2 bg-surface-container-low rounded-lg border border-outline-variant/30">
                  {availableProducts.map((p) => {
                    const isSelected = formData.curation.products.includes(p._id);
                    return (
                      <div
                        key={p._id}
                        onClick={() => toggleProductSelection(p._id)}
                        className={`p-2 rounded flex items-center justify-between cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border border-primary/30 text-on-surface'
                            : 'hover:bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-7 h-9 object-cover rounded bg-neutral-900" />
                          ) : (
                            <div className="w-7 h-9 bg-neutral-800 rounded flex items-center justify-center text-[10px]">
                              DR
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-medium text-on-surface block truncate">{p.name}</span>
                            <span className="font-mono text-[10px] text-outline">${(p.priceCents / 100).toFixed(2)} • {p.sku}</span>
                          </div>
                        </div>

                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary border-primary text-black' : 'border-outline-variant'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/60 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Section'}
          </Button>
        </div>

      </div>
    </div>
  );
}

