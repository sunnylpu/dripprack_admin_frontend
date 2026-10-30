import test from 'node:test';
import assert from 'node:assert/strict';
import { orderApi } from '../src/features/orders/orderApi.js';
import { apiClient, normalizeApiResponse } from '../src/lib/apiClient.js';
import { formatCurrency } from '../src/lib/formatters.js';

test('orderApi.getAdminOrders builds correct query string with supported filters and omits sort parameter', async () => {
  const originalGet = apiClient.get;
  let capturedEndpoint = null;

  apiClient.get = async (endpoint) => {
    capturedEndpoint = endpoint;
    return { orders: [], meta: { page: 1, limit: 10, total: 0 } };
  };

  try {
    await orderApi.getAdminOrders({
      page: 2,
      limit: 15,
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'online',
      startDate: '2026-10-01T00:00:00.000Z',
      endDate: '2026-10-27T23:59:59.999Z',
      search: 'ORD-20261027'
    });

    assert.ok(capturedEndpoint);
    assert.ok(capturedEndpoint.startsWith('/admin/orders?'));
    const url = new URL(`http://localhost${capturedEndpoint}`);
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(url.searchParams.get('limit'), '15');
    assert.equal(url.searchParams.get('orderStatus'), 'confirmed');
    assert.equal(url.searchParams.get('paymentStatus'), 'paid');
    assert.equal(url.searchParams.get('paymentMethod'), 'online');
    assert.equal(url.searchParams.get('startDate'), '2026-10-01T00:00:00.000Z');
    assert.equal(url.searchParams.get('endDate'), '2026-10-27T23:59:59.999Z');
    assert.equal(url.searchParams.get('search'), 'ORD-20261027');

    // Crucial check: verify that NO sort or sortBy parameter is sent to backend
    assert.equal(url.searchParams.has('sortBy'), false);
    assert.equal(url.searchParams.has('sort'), false);
  } finally {
    apiClient.get = originalGet;
  }
});

test('orderApi.getAdminOrders omits empty or default filters', async () => {
  const originalGet = apiClient.get;
  let capturedEndpoint = null;

  apiClient.get = async (endpoint) => {
    capturedEndpoint = endpoint;
    return { orders: [], meta: { page: 1, limit: 10, total: 0 } };
  };

  try {
    await orderApi.getAdminOrders({
      page: 1,
      limit: 10,
      orderStatus: 'all',
      paymentStatus: 'all',
      paymentMethod: 'all',
      search: '   '
    });

    assert.ok(capturedEndpoint);
    const url = new URL(`http://localhost${capturedEndpoint}`);
    assert.equal(url.searchParams.get('page'), '1');
    assert.equal(url.searchParams.get('limit'), '10');
    assert.equal(url.searchParams.has('orderStatus'), false);
    assert.equal(url.searchParams.has('paymentStatus'), false);
    assert.equal(url.searchParams.has('paymentMethod'), false);
    assert.equal(url.searchParams.has('search'), false);
    assert.equal(url.searchParams.has('sortBy'), false);
  } finally {
    apiClient.get = originalGet;
  }
});

test('orderApi.getOrderByReference requests correct relative endpoint with encoded reference', async () => {
  const originalGet = apiClient.get;
  let capturedEndpoint = null;

  apiClient.get = async (endpoint) => {
    capturedEndpoint = endpoint;
    return {
      order: { orderReference: 'ORD-20261027-F7A9B1' },
      payment: { status: 'cod_due' },
      auditLogs: []
    };
  };

  try {
    const res = await orderApi.getOrderByReference('ORD-20261027-F7A9B1');
    assert.equal(capturedEndpoint, '/admin/orders/ORD-20261027-F7A9B1');
    assert.equal(res.order.orderReference, 'ORD-20261027-F7A9B1');
    assert.equal(res.payment.status, 'cod_due');
  } finally {
    apiClient.get = originalGet;
  }
});

test('orderApi.updateOrderStatus transmits status and tracking details when advancing to shipped', async () => {
  const originalPatch = apiClient.patch;
  let capturedEndpoint = null;
  let capturedPayload = null;

  apiClient.patch = async (endpoint, payload) => {
    capturedEndpoint = endpoint;
    capturedPayload = payload;
    return {
      order: { orderReference: 'ORD-20261027-F7A9B1', orderStatus: payload.status }
    };
  };

  try {
    const tracking = {
      carrier: 'FedEx Express',
      trackingNumber: '784910294821',
      trackingUrl: 'https://fedex.com/track/784910294821'
    };

    const res = await orderApi.updateOrderStatus('ORD-20261027-F7A9B1', {
      status: 'shipped',
      tracking
    });

    assert.equal(capturedEndpoint, '/admin/orders/ORD-20261027-F7A9B1/status');
    assert.equal(capturedPayload.status, 'shipped');
    assert.deepEqual(capturedPayload.tracking, tracking);
    assert.equal(res.order.orderStatus, 'shipped');
  } finally {
    apiClient.patch = originalPatch;
  }
});

test('orderApi.updateOrderStatus sends codPaymentCollected when advancing to delivered', async () => {
  const originalPatch = apiClient.patch;
  let capturedEndpoint = null;
  let capturedPayload = null;

  apiClient.patch = async (endpoint, payload) => {
    capturedEndpoint = endpoint;
    capturedPayload = payload;
    return {
      order: { orderReference: 'ORD-20261027-F7A9B1', orderStatus: 'delivered' },
      payment: { status: 'paid' }
    };
  };

  try {
    const res = await orderApi.updateOrderStatus('ORD-20261027-F7A9B1', {
      status: 'delivered',
      codPaymentCollected: true
    });

    assert.equal(capturedEndpoint, '/admin/orders/ORD-20261027-F7A9B1/status');
    assert.equal(capturedPayload.status, 'delivered');
    assert.equal(capturedPayload.codPaymentCollected, true);
    assert.equal(res.order.orderStatus, 'delivered');
  } finally {
    apiClient.patch = originalPatch;
  }
});

test('orderApi.cancelOrder transmits cancellation reason', async () => {
  const originalPost = apiClient.post;
  let capturedEndpoint = null;
  let capturedPayload = null;

  apiClient.post = async (endpoint, payload) => {
    capturedEndpoint = endpoint;
    capturedPayload = payload;
    return {
      order: { orderReference: 'ORD-20261027-F7A9B1', orderStatus: 'cancelled' },
      isStockRestocked: true
    };
  };

  try {
    const res = await orderApi.cancelOrder('ORD-20261027-F7A9B1', {
      reason: 'Customer requested cancellation prior to packing'
    });

    assert.equal(capturedEndpoint, '/admin/orders/ORD-20261027-F7A9B1/cancel');
    assert.deepEqual(capturedPayload, {
      reason: 'Customer requested cancellation prior to packing'
    });
    assert.equal(res.order.orderStatus, 'cancelled');
    assert.equal(res.isStockRestocked, true);
  } finally {
    apiClient.post = originalPost;
  }
});

test('normalizeApiResponse preserves order pagination metadata alongside orders data', () => {
  const backendEnvelope = {
    statusCode: 200,
    message: 'Orders retrieved successfully',
    data: {
      orders: [{ orderReference: 'ORD-001' }, { orderReference: 'ORD-002' }]
    },
    meta: {
      page: 1,
      limit: 10,
      total: 42,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: false
    }
  };

  const normalized = normalizeApiResponse(backendEnvelope);
  assert.equal(normalized.orders.length, 2);
  assert.equal(normalized.meta.total, 42);
  assert.equal(normalized.meta.totalPages, 5);
  assert.equal(normalized.meta.hasNextPage, true);
});

test('formatCurrency formats minor units accurately using the order currency', () => {
  assert.equal(formatCurrency(18500, 'USD'), '$185.00');
  assert.equal(formatCurrency(14500, 'EUR'), '€145.00');
  assert.equal(formatCurrency(26000, 'GBP'), '£260.00');
  assert.equal(formatCurrency(0, 'USD'), '$0.00');
  assert.equal(formatCurrency(null, 'USD'), '—');
});
