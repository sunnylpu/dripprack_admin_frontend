import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryApi } from '../src/features/inventory/inventoryApi.js';
import { apiClient } from '../src/lib/apiClient.js';

test('inventoryApi.getStockList constructs correct query string with filters and pagination', async () => {
  const originalGet = apiClient.get;
  let capturedEndpoint = null;

  apiClient.get = async (endpoint) => {
    capturedEndpoint = endpoint;
    return { stock: [], meta: { page: 2, limit: 10, total: 0 } };
  };

  try {
    await inventoryApi.getStockList({
      page: 2,
      limit: 10,
      q: 'hoodie',
      category: 'streetwear-hoodies',
      lowStockOnly: true,
      inStock: 'true',
      sortBy: 'available:asc'
    });

    assert.ok(capturedEndpoint);
    assert.ok(capturedEndpoint.startsWith('/inventory/stock?'));
    const url = new URL(`http://localhost${capturedEndpoint}`);
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(url.searchParams.get('limit'), '10');
    assert.equal(url.searchParams.get('q'), 'hoodie');
    assert.equal(url.searchParams.get('category'), 'streetwear-hoodies');
    assert.equal(url.searchParams.get('lowStockOnly'), 'true');
    assert.equal(url.searchParams.get('inStock'), 'true');
    assert.equal(url.searchParams.get('sortBy'), 'available:asc');
  } finally {
    apiClient.get = originalGet;
  }
});

test('inventoryApi.getLowStock constructs correct query string', async () => {
  const originalGet = apiClient.get;
  let capturedEndpoint = null;

  apiClient.get = async (endpoint) => {
    capturedEndpoint = endpoint;
    return { products: [], meta: { page: 1, limit: 20, total: 3 } };
  };

  try {
    await inventoryApi.getLowStock({
      page: 1,
      limit: 20,
      q: 'cargos',
      category: 'bottoms',
      sortBy: 'available:asc'
    });

    assert.ok(capturedEndpoint);
    assert.ok(capturedEndpoint.startsWith('/inventory/low-stock?'));
    const url = new URL(`http://localhost${capturedEndpoint}`);
    assert.equal(url.searchParams.get('page'), '1');
    assert.equal(url.searchParams.get('limit'), '20');
    assert.equal(url.searchParams.get('q'), 'cargos');
    assert.equal(url.searchParams.get('category'), 'bottoms');
    assert.equal(url.searchParams.get('sortBy'), 'available:asc');
  } finally {
    apiClient.get = originalGet;
  }
});

test('inventoryApi.getMovements constructs correct query string with type and dates', async () => {
  const originalGet = apiClient.get;
  let capturedEndpoint = null;

  apiClient.get = async (endpoint) => {
    capturedEndpoint = endpoint;
    return { movements: [], meta: { page: 1, limit: 25, total: 50 } };
  };

  try {
    await inventoryApi.getMovements({
      page: 1,
      limit: 25,
      movementType: 'adjustment',
      startDate: '2026-10-01T00:00:00.000Z',
      endDate: '2026-10-30T23:59:59.999Z',
      sortBy: 'createdAt:desc'
    });

    assert.ok(capturedEndpoint);
    assert.ok(capturedEndpoint.startsWith('/inventory/movements?'));
    const url = new URL(`http://localhost${capturedEndpoint}`);
    assert.equal(url.searchParams.get('page'), '1');
    assert.equal(url.searchParams.get('limit'), '25');
    assert.equal(url.searchParams.get('movementType'), 'adjustment');
    assert.equal(url.searchParams.get('startDate'), '2026-10-01T00:00:00.000Z');
    assert.equal(url.searchParams.get('endDate'), '2026-10-30T23:59:59.999Z');
    assert.equal(url.searchParams.get('sortBy'), 'createdAt:desc');
  } finally {
    apiClient.get = originalGet;
  }
});

test('inventoryApi.adjustStock transmits payload and Idempotency-Key header', async () => {
  const originalPost = apiClient.post;
  let capturedEndpoint = null;
  let capturedPayload = null;
  let capturedOptions = null;

  apiClient.post = async (endpoint, payload, options) => {
    capturedEndpoint = endpoint;
    capturedPayload = payload;
    capturedOptions = options;
    return {
      product: { _id: payload.productId, sku: 'DRIP-TEST-01' },
      movement: { _id: 'mov123', quantityDelta: payload.quantityDelta }
    };
  };

  try {
    const customKey = 'test-idempotency-key-uuid-1234';
    const result = await inventoryApi.adjustStock(
      {
        productId: '653f8a129e1b2c001f38e0a1',
        quantityDelta: 25,
        reason: 'Restock batch from manufacturing vendor'
      },
      customKey
    );

    assert.equal(capturedEndpoint, '/inventory/adjust');
    assert.deepEqual(capturedPayload, {
      productId: '653f8a129e1b2c001f38e0a1',
      quantityDelta: 25,
      reason: 'Restock batch from manufacturing vendor'
    });
    assert.ok(capturedOptions?.headers);
    assert.equal(capturedOptions.headers['Idempotency-Key'], customKey);
    assert.equal(result.product.sku, 'DRIP-TEST-01');
    assert.equal(result.movement.quantityDelta, 25);
  } finally {
    apiClient.post = originalPost;
  }
});

