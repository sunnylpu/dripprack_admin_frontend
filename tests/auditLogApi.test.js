import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLogApi } from '../src/features/auditLogs/auditLogApi.js';
import { apiClient, normalizeApiResponse } from '../src/lib/apiClient.js';

test('auditLogApi.getAdminAuditLogs builds query string with all supported parameters and omits sort/search', async () => {
  const originalGet = apiClient.get;
  let capturedEndpoint = null;

  apiClient.get = async (endpoint) => {
    capturedEndpoint = endpoint;
    return { auditLogs: [], meta: { page: 1, limit: 20, total: 0 } };
  };

  try {
    await auditLogApi.getAdminAuditLogs({
      page: 2,
      limit: 25,
      actor: '653f8a129e1b2c001f38e0a1',
      action: 'ORDER_STATUS_CHANGED',
      resourceType: 'order',
      resourceId: 'ORD-20261027-F7A9B1',
      startDate: '2026-10-01T00:00:00.000Z',
      endDate: '2026-10-27T23:59:59.999Z'
    });

    assert.ok(capturedEndpoint);
    assert.ok(capturedEndpoint.startsWith('/admin/audit-logs?'));
    const url = new URL(`http://localhost${capturedEndpoint}`);
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(url.searchParams.get('limit'), '25');
    assert.equal(url.searchParams.get('actor'), '653f8a129e1b2c001f38e0a1');
    assert.equal(url.searchParams.get('action'), 'ORDER_STATUS_CHANGED');
    assert.equal(url.searchParams.get('resourceType'), 'order');
    assert.equal(url.searchParams.get('resourceId'), 'ORD-20261027-F7A9B1');
    assert.equal(url.searchParams.get('startDate'), '2026-10-01T00:00:00.000Z');
    assert.equal(url.searchParams.get('endDate'), '2026-10-27T23:59:59.999Z');

    // Crucial check: verify that NO sort, sortBy, search, or severity parameters are sent
    assert.equal(url.searchParams.has('sortBy'), false);
    assert.equal(url.searchParams.has('sort'), false);
    assert.equal(url.searchParams.has('search'), false);
    assert.equal(url.searchParams.has('q'), false);
    assert.equal(url.searchParams.has('severity'), false);
  } finally {
    apiClient.get = originalGet;
  }
});

test('auditLogApi.getAdminAuditLogs omits empty or default filter values', async () => {
  const originalGet = apiClient.get;
  let capturedEndpoint = null;

  apiClient.get = async (endpoint) => {
    capturedEndpoint = endpoint;
    return { auditLogs: [], meta: { page: 1, limit: 20, total: 0 } };
  };

  try {
    await auditLogApi.getAdminAuditLogs({
      page: 1,
      limit: 20,
      action: 'ALL',
      resourceType: 'ALL',
      resourceId: '',
      actor: '   ',
      startDate: null,
      endDate: undefined
    });

    assert.ok(capturedEndpoint);
    const url = new URL(`http://localhost${capturedEndpoint}`);
    assert.equal(url.searchParams.get('page'), '1');
    assert.equal(url.searchParams.get('limit'), '20');
    assert.equal(url.searchParams.has('action'), false);
    assert.equal(url.searchParams.has('resourceType'), false);
    assert.equal(url.searchParams.has('resourceId'), false);
    assert.equal(url.searchParams.has('actor'), false);
    assert.equal(url.searchParams.has('startDate'), false);
    assert.equal(url.searchParams.has('endDate'), false);
    assert.equal(url.searchParams.has('sortBy'), false);
  } finally {
    apiClient.get = originalGet;
  }
});

test('normalizeApiResponse unpacks auditLogs and preserves pagination metadata', () => {
  const backendEnvelope = {
    statusCode: 200,
    message: 'Audit logs retrieved successfully',
    data: {
      auditLogs: [
        {
          _id: '653f8a129e1b2c001f38e0b1',
          action: 'ORDER_STATUS_CHANGED',
          resourceType: 'order',
          resourceId: 'ORD-001',
          createdAt: '2026-10-27T14:35:12.000Z'
        }
      ]
    },
    meta: {
      page: 1,
      limit: 20,
      total: 142,
      totalPages: 8,
      hasNextPage: true,
      hasPrevPage: false
    }
  };

  const normalized = normalizeApiResponse(backendEnvelope);
  assert.equal(normalized.auditLogs.length, 1);
  assert.equal(normalized.auditLogs[0].action, 'ORDER_STATUS_CHANGED');
  assert.equal(normalized.meta.total, 142);
  assert.equal(normalized.meta.totalPages, 8);
});

test('auditLogApi has no mutation methods and remains strictly read-only', () => {
  assert.equal(typeof auditLogApi.getAdminAuditLogs, 'function');
  assert.equal(auditLogApi.createAuditLog, undefined);
  assert.equal(auditLogApi.updateAuditLog, undefined);
  assert.equal(auditLogApi.deleteAuditLog, undefined);
});

