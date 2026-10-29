import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/lib/errors.js';

test('ApiError correctly encapsulates status code, message, and error code', () => {
  const err = new ApiError('Forbidden operation', {
    code: 'FORBIDDEN_ROLE',
    status: 403,
    details: { requiredRole: 'admin' }
  });

  assert.equal(err.name, 'ApiError');
  assert.equal(err.message, 'Forbidden operation');
  assert.equal(err.status, 403);
  assert.equal(err.code, 'FORBIDDEN_ROLE');
  assert.deepEqual(err.details, { requiredRole: 'admin' });
});

test('ApiError.fromResponse unpacks standard backend error envelope', () => {
  const envelope = {
    success: false,
    error: {
      message: 'Invalid credentials provided',
      code: 'INVALID_CREDENTIALS',
      details: null
    }
  };

  const err = ApiError.fromResponse(envelope, 401);
  assert.equal(err.status, 401);
  assert.equal(err.code, 'INVALID_CREDENTIALS');
  assert.equal(err.message, 'Invalid credentials provided');
});

test('ApiError.fromResponse provides fallback code when backend envelope is empty', () => {
  const err = ApiError.fromResponse(null, 500);
  assert.equal(err.status, 500);
  assert.equal(err.code, 'API_ERROR');
  assert.equal(err.message, 'An unexpected error occurred');
});

test('ApiError.networkError creates standardized 0-status network failure', () => {
  const original = new TypeError('Failed to fetch');
  const err = ApiError.networkError(original);

  assert.equal(err.status, 0);
  assert.equal(err.code, 'NETWORK_ERROR');
  assert.match(err.message, /Unable to connect to the DripRack API server/i);
  assert.deepEqual(err.details, ['Failed to fetch']);
});
