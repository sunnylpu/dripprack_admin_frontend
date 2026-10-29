import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiResponse } from '../src/lib/apiClient.js';

test('normalizeApiResponse unpacks payload.data and preserves top-level meta for paginated responses', () => {
  const paginatedPayload = {
    success: true,
    statusCode: 200,
    message: 'Products retrieved successfully',
    data: {
      products: [
        { _id: 'prod1', name: 'Hoodie' },
        { _id: 'prod2', name: 'Cargo Pants' }
      ]
    },
    meta: {
      page: 1,
      limit: 20,
      total: 54,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: false
    }
  };

  const result = normalizeApiResponse(paginatedPayload);
  assert.equal(Array.isArray(result.products), true);
  assert.equal(result.products.length, 2);
  assert.deepEqual(result.meta, {
    page: 1,
    limit: 20,
    total: 54,
    totalPages: 3,
    hasNextPage: true,
    hasPrevPage: false
  });
});

test('normalizeApiResponse preserves single resource objects without meta', () => {
  const singleResourcePayload = {
    success: true,
    statusCode: 200,
    message: 'User profile retrieved successfully',
    data: {
      user: {
        _id: 'user123',
        role: 'admin',
        email: 'admin@driprack.com'
      }
    }
  };

  const result = normalizeApiResponse(singleResourcePayload);
  assert.deepEqual(result, {
    user: {
      _id: 'user123',
      role: 'admin',
      email: 'admin@driprack.com'
    }
  });
  assert.equal(result.meta, undefined);
});

test('normalizeApiResponse handles non-envelope or primitive data safely', () => {
  assert.equal(normalizeApiResponse(null), null);
  assert.equal(normalizeApiResponse(undefined), undefined);
  assert.equal(normalizeApiResponse('raw string'), 'raw string');
});

