import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCategoryForm } from '../src/features/categories/categoryValidation.js';

test('validateCategoryForm validates standard category input', () => {
  const form = {
    name: 'Streetwear Tops',
    slug: 'streetwear-tops',
    description: 'Heavyweight hoodies and engineered layering tees.',
    isActive: true
  };

  const { isValid, errors, parsedPayload } = validateCategoryForm(form);
  assert.equal(isValid, true);
  assert.deepEqual(errors, {});
  assert.equal(parsedPayload.name, 'Streetwear Tops');
  assert.equal(parsedPayload.slug, 'streetwear-tops');
});

test('validateCategoryForm rejects invalid names and non-kebab-case slugs', () => {
  const form = {
    name: 'X', // Too short (min 2)
    slug: 'Invalid Slug with Spaces',
    description: 'A'.repeat(501) // Too long (max 500)
  };

  const { isValid, errors } = validateCategoryForm(form);
  assert.equal(isValid, false);
  assert.ok(errors.name);
  assert.ok(errors.slug);
  assert.ok(errors.description);
});

