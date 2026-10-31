import { parseCurrencyToCents } from '../../lib/formatters.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const SKU_REGEX = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTPS_URL_REGEX = /^https:\/\/[^\s$.?#].[^\s]*$/i;

/**
 * Validates product creation or editing form inputs against backend constraints.
 *
 * @param {object} formData
 * @param {boolean} [isUpdate=false]
 * @returns {{ isValid: boolean, errors: Record<string, string>, parsedPayload?: object }}
 */
export function validateProductForm(formData, isUpdate = false) {
  const errors = {};

  // SKU validation
  const rawSku = (formData.sku || '').trim().toUpperCase();
  if (!rawSku && !isUpdate) {
    errors.sku = 'SKU is required';
  } else if (rawSku) {
    if (rawSku.length < 3 || rawSku.length > 50) {
      errors.sku = 'SKU must be between 3 and 50 characters';
    } else if (!SKU_REGEX.test(rawSku)) {
      errors.sku = 'SKU must contain only uppercase alphanumeric characters and single hyphens (e.g. DRIP-HOODIE-BLK-M)';
    }
  }

  // Name validation
  const name = (formData.name || '').trim();
  if (!name && !isUpdate) {
    errors.name = 'Product name is required';
  } else if (name && (name.length < 2 || name.length > 200)) {
    errors.name = 'Product name must be between 2 and 200 characters';
  }

  // Slug validation (optional)
  const slug = (formData.slug || '').trim().toLowerCase();
  if (slug) {
    if (slug.length > 220) {
      errors.slug = 'Slug cannot exceed 220 characters';
    } else if (!SLUG_REGEX.test(slug)) {
      errors.slug = 'Slug must be valid lowercase kebab-case (e.g. acid-hoodie-v1)';
    }
  }

  // Description validation
  const description = (formData.description || '').trim();
  if (!description && !isUpdate) {
    errors.description = 'Product description is required';
  } else if (description && (description.length < 10 || description.length > 5000)) {
    errors.description = 'Description must be between 10 and 5000 characters';
  }

  // Category validation
  const categoryId = (formData.category || '').trim();
  if (!categoryId && !isUpdate) {
    errors.category = 'A valid category must be selected';
  } else if (categoryId && !OBJECT_ID_REGEX.test(categoryId)) {
    errors.category = 'Invalid category ID selected';
  }

  // Price validation
  let priceCents;
  try {
    if (formData.price === undefined || formData.price === null || formData.price === '') {
      if (!isUpdate) {
        errors.price = 'Price is required';
      }
    } else {
      priceCents = parseCurrencyToCents(formData.price);
    }
  } catch (err) {
    errors.price = err.message || 'Invalid price';
  }

  // Compare-At Price validation (optional)
  let compareAtPriceCents = null;
  const rawCompare = formData.compareAtPrice !== undefined && formData.compareAtPrice !== null
    ? String(formData.compareAtPrice).trim()
    : '';

  if (rawCompare !== '') {
    try {
      compareAtPriceCents = parseCurrencyToCents(rawCompare);
      if (priceCents !== undefined && compareAtPriceCents < priceCents) {
        errors.compareAtPrice = 'Compare-at price cannot be less than selling price';
      }
    } catch (err) {
      errors.compareAtPrice = err.message || 'Invalid compare-at price';
    }
  }

  // Images validation (array of HTTPS URLs, max 10)
  const images = Array.isArray(formData.images)
    ? formData.images.map((url) => String(url).trim()).filter(Boolean)
    : [];

  if (images.length > 10) {
    errors.images = 'Cannot exceed 10 product images';
  } else {
    for (const url of images) {
      if (!HTTPS_URL_REGEX.test(url)) {
        errors.images = 'All image URLs must use secure HTTPS protocols (e.g. https://...)';
        break;
      }
    }
  }

  // Low stock threshold (optional, non-negative integer)
  let lowStockThreshold = 5;
  if (formData.lowStockThreshold !== undefined && formData.lowStockThreshold !== '') {
    const parsedThreshold = Number(formData.lowStockThreshold);
    if (!Number.isInteger(parsedThreshold) || parsedThreshold < 0) {
      errors.lowStockThreshold = 'Low stock threshold must be a non-negative integer';
    } else {
      lowStockThreshold = parsedThreshold;
    }
  }

  // Variant attributes: one product document represents one sellable SKU.
  const size = (formData.size ?? formData.attributes?.size ?? '').trim();
  if (size.length > 50) {
    errors.size = 'Size cannot exceed 50 characters';
  }

  const color = (formData.color ?? formData.attributes?.color ?? '').trim();
  if (color.length > 50) {
    errors.color = 'Color cannot exceed 50 characters';
  }

  // Status (optional draft, published, archived)
  const status = formData.status || 'draft';
  if (!['draft', 'published', 'archived'].includes(status)) {
    errors.status = 'Status must be draft, published, or archived';
  }

  const isValid = Object.keys(errors).length === 0;

  // Construct sanitized API payload
  const parsedPayload = {};
  if (rawSku) parsedPayload.sku = rawSku;
  if (name) parsedPayload.name = name;
  if (slug) parsedPayload.slug = slug;
  if (description) parsedPayload.description = description;
  if (categoryId) parsedPayload.category = categoryId;
  if (priceCents !== undefined) parsedPayload.priceCents = priceCents;
  if (rawCompare !== '') {
    parsedPayload.compareAtPriceCents = compareAtPriceCents;
  } else if (isUpdate) {
    parsedPayload.compareAtPriceCents = null; // Backend accepts null to unset compareAtPrice
  }
  parsedPayload.images = images;
  parsedPayload.attributes = {
    size: size || null,
    color: color || null
  };
  if (!isUpdate || formData.status) parsedPayload.status = status;
  parsedPayload.lowStockThreshold = lowStockThreshold;

  return {
    isValid,
    errors,
    parsedPayload
  };
}

