import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateStockAdjustment,
  validateMovementDateRange,
  generateIdempotencyKey
} from '../src/features/inventory/inventoryValidation.js';

test('validateStockAdjustment succeeds on valid positive restock payload', () => {
  const result = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: 50,
    reason: 'Supplier inbound batch received from manufacturing facility',
    availableStock: 10
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.parsedPayload.productId, '653f8a129e1b2c001f38e0a1');
  assert.equal(result.parsedPayload.quantityDelta, 50);
  assert.equal(
    result.parsedPayload.reason,
    'Supplier inbound batch received from manufacturing facility'
  );
});

test('validateStockAdjustment succeeds on valid negative deduction within available stock', () => {
  const result = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: -8,
    reason: 'Damaged item identified during warehouse transit inspection',
    availableStock: 10
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.parsedPayload.quantityDelta, -8);
});

test('validateStockAdjustment rejects zero quantity delta', () => {
  const result = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: 0,
    reason: 'Invalid zero adjustment'
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.quantityDelta);
  assert.match(result.errors.quantityDelta, /zero/i);
});

test('validateStockAdjustment rejects non-integer decimals and malformed deltas', () => {
  const resultFloat = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: 12.5,
    reason: 'Cycle count decimal'
  });
  assert.equal(resultFloat.isValid, false);
  assert.ok(resultFloat.errors.quantityDelta);

  const resultNaN = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: 'not-a-number',
    reason: 'Cycle count invalid'
  });
  assert.equal(resultNaN.isValid, false);
  assert.ok(resultNaN.errors.quantityDelta);
});

test('validateStockAdjustment rejects delta exceeding magnitude limits (+/- 100,000)', () => {
  const resultOver = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: 150000,
    reason: 'Excessive restock'
  });
  assert.equal(resultOver.isValid, false);
  assert.ok(resultOver.errors.quantityDelta);

  const resultUnder = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: -100001,
    reason: 'Excessive deduction'
  });
  assert.equal(resultUnder.isValid, false);
  assert.ok(resultUnder.errors.quantityDelta);
});

test('validateStockAdjustment prevents deduction exceeding available stock', () => {
  const result = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: -15,
    reason: 'Defective units scrapped',
    availableStock: 10
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.quantityDelta);
  assert.match(result.errors.quantityDelta, /exceeds available stock/i);
});

test('validateStockAdjustment rejects invalid reason notes (empty, < 3 chars, > 500 chars)', () => {
  const emptyReason = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: 5,
    reason: '   '
  });
  assert.equal(emptyReason.isValid, false);
  assert.ok(emptyReason.errors.reason);

  const shortReason = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: 5,
    reason: 'ok'
  });
  assert.equal(shortReason.isValid, false);
  assert.ok(shortReason.errors.reason);

  const longReason = validateStockAdjustment({
    productId: '653f8a129e1b2c001f38e0a1',
    quantityDelta: 5,
    reason: 'a'.repeat(501)
  });
  assert.equal(longReason.isValid, false);
  assert.ok(longReason.errors.reason);
});

test('validateStockAdjustment rejects non-ObjectId productId format', () => {
  const invalidId = validateStockAdjustment({
    productId: 'invalid-id-123',
    quantityDelta: 5,
    reason: 'Standard adjustment'
  });
  assert.equal(invalidId.isValid, false);
  assert.ok(invalidId.errors.productId);
});

test('validateMovementDateRange correctly validates ISO date boundaries', () => {
  const valid = validateMovementDateRange({
    startDate: '2026-10-01',
    endDate: '2026-10-30'
  });
  assert.equal(valid.isValid, true);

  const inverted = validateMovementDateRange({
    startDate: '2026-10-31',
    endDate: '2026-10-01'
  });
  assert.equal(inverted.isValid, false);
  assert.match(inverted.error, /less than or equal/i);

  const invalidDate = validateMovementDateRange({
    startDate: 'invalid-date',
    endDate: '2026-10-30'
  });
  assert.equal(invalidDate.isValid, false);
});

test('generateIdempotencyKey produces valid RFC 4122 v4 UUID format', () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const key1 = generateIdempotencyKey();
  const key2 = generateIdempotencyKey();

  assert.match(key1, uuidRegex, `Key must be a valid UUIDv4: ${key1}`);
  assert.match(key2, uuidRegex, `Key must be a valid UUIDv4: ${key2}`);
  assert.notEqual(key1, key2, 'Generated keys must be unique');
});

