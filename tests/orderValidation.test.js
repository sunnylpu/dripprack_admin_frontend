import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTracking,
  validateCancelReason,
  checkOrderTransitionEligibility,
  checkOrderCancellationEligibility,
  validateOrderDateRange
} from '../src/features/orders/orderValidation.js';

test('validateTracking succeeds on valid carrier, trackingNumber, and HTTPS trackingUrl', () => {
  const result = validateTracking({
    carrier: 'FedEx Express',
    trackingNumber: '784910294821',
    trackingUrl: 'https://fedex.com/track/784910294821'
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.parsedPayload.carrier, 'FedEx Express');
  assert.equal(result.parsedPayload.trackingNumber, '784910294821');
  assert.equal(result.parsedPayload.trackingUrl, 'https://fedex.com/track/784910294821');
});

test('validateTracking rejects non-HTTPS or malformed tracking URLs', () => {
  // Insecure HTTP URL
  const httpResult = validateTracking({
    carrier: 'DHL Express',
    trackingNumber: '123456789',
    trackingUrl: 'http://dhl.com/track/123456789'
  });
  assert.equal(httpResult.isValid, false);
  assert.ok(httpResult.errors.trackingUrl);
  assert.match(httpResult.errors.trackingUrl, /HTTPS/i);

  // Invalid URL format
  const invalidResult = validateTracking({
    carrier: 'DHL Express',
    trackingNumber: '123456789',
    trackingUrl: 'not-a-valid-url'
  });
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.trackingUrl);
});

test('validateTracking enforces character length bounds for carrier and trackingNumber', () => {
  const shortResult = validateTracking({
    carrier: 'A', // too short (< 2)
    trackingNumber: '12', // too short (< 3)
    trackingUrl: 'https://carrier.com/track/12'
  });
  assert.equal(shortResult.isValid, false);
  assert.ok(shortResult.errors.carrier);
  assert.ok(shortResult.errors.trackingNumber);

  const emptyResult = validateTracking({});
  assert.equal(emptyResult.isValid, false);
  assert.ok(emptyResult.errors.carrier);
  assert.ok(emptyResult.errors.trackingNumber);
  assert.ok(emptyResult.errors.trackingUrl);

  const longResult = validateTracking({
    carrier: 'A'.repeat(101),
    trackingNumber: 'B'.repeat(101),
    trackingUrl: 'https://carrier.com/track/123'
  });
  assert.equal(longResult.isValid, false);
  assert.ok(longResult.errors.carrier);
  assert.ok(longResult.errors.trackingNumber);
});

test('validateCancelReason allows empty or undefined, but enforces 3-500 length when provided', () => {
  assert.equal(validateCancelReason().isValid, true);
  assert.equal(validateCancelReason('').isValid, true);
  assert.equal(validateCancelReason('   ').isValid, true);

  const valid = validateCancelReason('Customer requested immediate cancellation prior to dispatch');
  assert.equal(valid.isValid, true);
  assert.equal(valid.parsedReason, 'Customer requested immediate cancellation prior to dispatch');

  const tooShort = validateCancelReason('no');
  assert.equal(tooShort.isValid, false);
  assert.ok(tooShort.error);
  assert.match(tooShort.error, /at least 3 characters/i);

  const tooLong = validateCancelReason('A'.repeat(501));
  assert.equal(tooLong.isValid, false);
  assert.ok(tooLong.error);
  assert.match(tooLong.error, /cannot exceed 500 characters/i);
});

test('checkOrderTransitionEligibility enforces sequential fulfillment flow (confirmed -> processing -> shipped -> delivered)', () => {
  // Step 1 -> Step 2
  const step1 = checkOrderTransitionEligibility(
    { orderStatus: 'confirmed', paymentMethod: 'cod', paymentStatus: 'cod_due' },
    'processing'
  );
  assert.equal(step1.allowed, true);

  // Step 2 -> Step 3
  const step2 = checkOrderTransitionEligibility(
    { orderStatus: 'processing', paymentMethod: 'cod', paymentStatus: 'cod_due' },
    'shipped'
  );
  assert.equal(step2.allowed, true);

  // Step 3 -> Step 4
  const step3 = checkOrderTransitionEligibility(
    { orderStatus: 'shipped', paymentMethod: 'cod', paymentStatus: 'cod_due' },
    'delivered'
  );
  assert.equal(step3.allowed, true);

  // Disallowed non-sequential jump: confirmed -> shipped
  const jump1 = checkOrderTransitionEligibility(
    { orderStatus: 'confirmed', paymentMethod: 'cod', paymentStatus: 'cod_due' },
    'shipped'
  );
  assert.equal(jump1.allowed, false);

  // Disallowed non-sequential jump: confirmed -> delivered
  const jump2 = checkOrderTransitionEligibility(
    { orderStatus: 'confirmed', paymentMethod: 'cod', paymentStatus: 'cod_due' },
    'delivered'
  );
  assert.equal(jump2.allowed, false);
});

test('checkOrderTransitionEligibility disallows manual progression for awaiting_payment, cancelled, or delivered orders', () => {
  const awaiting = checkOrderTransitionEligibility(
    { orderStatus: 'awaiting_payment', paymentMethod: 'online', paymentStatus: 'pending' },
    'processing'
  );
  assert.equal(awaiting.allowed, false);
  assert.match(awaiting.reason, /awaiting payment/i);

  const cancelled = checkOrderTransitionEligibility(
    { orderStatus: 'cancelled', paymentMethod: 'cod', paymentStatus: 'failed' },
    'processing'
  );
  assert.equal(cancelled.allowed, false);
  assert.match(cancelled.reason, /cancelled/i);

  const delivered = checkOrderTransitionEligibility(
    { orderStatus: 'delivered', paymentMethod: 'cod', paymentStatus: 'paid' },
    'shipped'
  );
  assert.equal(delivered.allowed, false);
  assert.match(delivered.reason, /delivered/i);
});

test('checkOrderTransitionEligibility enforces online payment requirement before fulfillment', () => {
  // Online order with pending payment cannot advance to processing
  const unverified = checkOrderTransitionEligibility(
    { orderStatus: 'confirmed', paymentMethod: 'online', paymentStatus: 'pending' },
    'processing'
  );
  assert.equal(unverified.allowed, false);
  assert.match(unverified.reason, /verified payment/i);

  // Online order with verified paid payment can advance to processing
  const verified = checkOrderTransitionEligibility(
    { orderStatus: 'confirmed', paymentMethod: 'online', paymentStatus: 'paid' },
    'processing'
  );
  assert.equal(verified.allowed, true);
});

test('checkOrderCancellationEligibility enforces cancellation state machine and rejects paid orders', () => {
  // Eligible orders in awaiting_payment, confirmed, or processing with unpaid status
  assert.equal(
    checkOrderCancellationEligibility({
      orderStatus: 'awaiting_payment',
      paymentStatus: 'pending'
    }).cancellable,
    true
  );
  assert.equal(
    checkOrderCancellationEligibility({
      orderStatus: 'confirmed',
      paymentStatus: 'pending'
    }).cancellable,
    true
  );
  assert.equal(
    checkOrderCancellationEligibility({
      orderStatus: 'processing',
      paymentStatus: 'cod_due'
    }).cancellable,
    true
  );

  // Rejects already cancelled orders
  const alreadyCancelled = checkOrderCancellationEligibility({
    orderStatus: 'cancelled',
    paymentStatus: 'failed'
  });
  assert.equal(alreadyCancelled.cancellable, false);

  // Rejects shipped and delivered orders
  const shipped = checkOrderCancellationEligibility({
    orderStatus: 'shipped',
    paymentStatus: 'cod_due'
  });
  assert.equal(shipped.cancellable, false);

  const delivered = checkOrderCancellationEligibility({
    orderStatus: 'delivered',
    paymentStatus: 'paid'
  });
  assert.equal(delivered.cancellable, false);

  // Rejects paid orders (no automatic refund supported)
  const paidOrder = checkOrderCancellationEligibility({
    orderStatus: 'confirmed',
    paymentStatus: 'paid'
  });
  assert.equal(paidOrder.cancellable, false);
  assert.match(paidOrder.reason, /refund processing is not supported/i);
});

test('validateOrderDateRange validates boundaries correctly', () => {
  assert.equal(validateOrderDateRange().isValid, true);
  assert.equal(
    validateOrderDateRange({ startDate: '2026-10-01', endDate: '2026-10-27' }).isValid,
    true
  );
  assert.equal(
    validateOrderDateRange({ startDate: '2026-10-28', endDate: '2026-10-27' }).isValid,
    false
  );
  assert.equal(
    validateOrderDateRange({ startDate: 'not-a-date', endDate: '2026-10-27' }).isValid,
    false
  );
});

