import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProductForm } from '../src/features/products/productValidation.js';

test('validateProductForm succeeds on valid product payload', () => {
  const form = {
    sku: 'DRIP-HOODIE-BLK-M',
    name: 'Cyberpunk Oversized Acid Hoodie',
    slug: 'cyberpunk-oversized-acid-hoodie',
    description: 'Heavyweight oversized streetwear hoodie designed for cold weather layering.',
    category: '653f8a129e1b2c001f38e0a1',
    size: 'M',
    color: 'Black',
    price: '149.99',
    compareAtPrice: '179.99',
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2'],
    status: 'draft',
    lowStockThreshold: 5
  };

  const { isValid, errors, parsedPayload } = validateProductForm(form);
  assert.equal(isValid, true, 'Form must be valid');
  assert.deepEqual(errors, {});
  assert.equal(parsedPayload.sku, 'DRIP-HOODIE-BLK-M');
  assert.equal(parsedPayload.priceCents, 14999);
  assert.equal(parsedPayload.compareAtPriceCents, 17999);
  assert.deepEqual(parsedPayload.attributes, { size: 'M', color: 'Black' });
});

test('validateProductForm catches invalid SKU, compareAtPrice < price, and non-HTTPS image URLs', () => {
  const form = {
    sku: 'invalid sku with spaces!',
    name: 'A',
    description: 'Short',
    category: 'invalid-id',
    price: '100.00',
    compareAtPrice: '80.00', // Invalid: compareAtPrice cannot be less than selling price
    images: ['http://insecure-url.com/image.png'] // Invalid: must be HTTPS
  };

  const { isValid, errors } = validateProductForm(form);
  assert.equal(isValid, false);
  assert.ok(errors.sku);
  assert.ok(errors.name);
  assert.ok(errors.description);
  assert.ok(errors.category);
  assert.ok(errors.compareAtPrice);
  assert.ok(errors.images);
});

