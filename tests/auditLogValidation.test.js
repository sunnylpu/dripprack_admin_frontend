import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateActorId,
  validateAuditDateRange,
  validateAuditFilterString,
  structureMixedDetails
} from '../src/features/auditLogs/auditLogValidation.js';

test('validateActorId validates 24-character hexadecimal MongoDB ObjectIds', () => {
  // Valid ObjectIds
  assert.equal(validateActorId('653f8a129e1b2c001f38e0a1').isValid, true);
  assert.equal(
    validateActorId('653f8a129e1b2c001f38e0a1').parsedActor,
    '653f8a129e1b2c001f38e0a1'
  );

  // Optional empty values
  assert.equal(validateActorId().isValid, true);
  assert.equal(validateActorId('').isValid, true);
  assert.equal(validateActorId('   ').isValid, true);

  // Invalid non-hex or invalid length strings
  const nonHex = validateActorId('653f8a129e1b2c001f38e0az');
  assert.equal(nonHex.isValid, false);
  assert.ok(nonHex.error);

  const shortId = validateActorId('12345');
  assert.equal(shortId.isValid, false);
  assert.ok(shortId.error);

  const longId = validateActorId('653f8a129e1b2c001f38e0a112345');
  assert.equal(longId.isValid, false);
  assert.ok(longId.error);
});

test('validateAuditDateRange validates ISO date boundaries correctly', () => {
  assert.equal(validateAuditDateRange().isValid, true);
  assert.equal(
    validateAuditDateRange({ startDate: '2026-10-01', endDate: '2026-10-27' }).isValid,
    true
  );
  assert.equal(
    validateAuditDateRange({ startDate: '2026-10-28', endDate: '2026-10-27' }).isValid,
    false
  );
  assert.equal(
    validateAuditDateRange({ startDate: 'invalid-date', endDate: '2026-10-27' }).isValid,
    false
  );
});

test('validateAuditFilterString enforces 100 character maximum limit', () => {
  assert.equal(validateAuditFilterString('ORDER_STATUS_CHANGED').isValid, true);
  assert.equal(
    validateAuditFilterString('ORDER_STATUS_CHANGED').parsedValue,
    'ORDER_STATUS_CHANGED'
  );
  assert.equal(validateAuditFilterString('').isValid, true);
  assert.equal(validateAuditFilterString(null).isValid, true);

  const tooLong = validateAuditFilterString('A'.repeat(101));
  assert.equal(tooLong.isValid, false);
  assert.ok(tooLong.error);
  assert.match(tooLong.error, /cannot exceed 100 characters/i);
});

test('structureMixedDetails safely handles primitives, nested objects, and arrays without throwing', () => {
  // 1. Null / undefined handling
  assert.deepEqual(structureMixedDetails(null), []);
  assert.deepEqual(structureMixedDetails(undefined), []);

  // 2. Primitives
  assert.deepEqual(structureMixedDetails('simple string'), [
    { key: 'value', value: 'simple string', isObject: false }
  ]);
  assert.deepEqual(structureMixedDetails(42), [
    { key: 'value', value: '42', isObject: false }
  ]);

  // 3. Flat object
  const flat = {
    previousStatus: 'confirmed',
    newStatus: 'processing',
    codPaymentCollected: true,
    amountCents: 18500
  };
  const structuredFlat = structureMixedDetails(flat);
  assert.equal(structuredFlat.length, 4);
  assert.equal(structuredFlat[0].key, 'previousStatus');
  assert.equal(structuredFlat[0].value, 'confirmed');
  assert.equal(structuredFlat[2].key, 'codPaymentCollected');
  assert.equal(structuredFlat[2].value, 'true');

  // 4. Nested object
  const nested = {
    tracking: {
      carrier: 'FedEx Express',
      trackingNumber: '784910294821'
    }
  };
  const structuredNested = structureMixedDetails(nested);
  assert.equal(structuredNested.length, 1);
  assert.equal(structuredNested[0].key, 'tracking');
  assert.equal(structuredNested[0].isObject, true);
  assert.equal(structuredNested[0].children.length, 2);
  assert.equal(structuredNested[0].children[0].key, 'carrier');
  assert.equal(structuredNested[0].children[0].value, 'FedEx Express');

  // 5. Array of items
  const arr = ['order', 'item'];
  const structuredArr = structureMixedDetails(arr);
  assert.equal(structuredArr.length, 2);
  assert.equal(structuredArr[0].key, '[0]');
  assert.equal(structuredArr[0].value, 'order');
});

