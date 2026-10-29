/**
 * Validation rules and helpers for DripRack Inventory & Stock Operations
 */

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Validates stock adjustment parameters before sending to POST /api/v1/inventory/adjust
 *
 * @param {Object} params
 * @param {string} params.productId - 24-character hexadecimal MongoDB ObjectId
 * @param {number|string} params.quantityDelta - Non-zero integer between -100,000 and 100,000
 * @param {string} params.reason - Audit note between 3 and 500 characters
 * @param {number} [params.availableStock] - Current available stock for client-side reduction limit check
 * @returns {{ isValid: boolean, errors: Record<string, string>, parsedPayload?: { productId: string, quantityDelta: number, reason: string } }}
 */
export function validateStockAdjustment({ productId, quantityDelta, reason, availableStock } = {}) {
  const errors = {};

  // 1. Validate Product ID
  if (!productId || typeof productId !== 'string' || !OBJECT_ID_REGEX.test(productId.trim())) {
    errors.productId = 'A valid 24-character product ID is required';
  }

  // 2. Validate Quantity Delta
  const numDelta = Number(quantityDelta);
  if (
    quantityDelta === undefined ||
    quantityDelta === null ||
    quantityDelta === '' ||
    Number.isNaN(numDelta)
  ) {
    errors.quantityDelta = 'Quantity delta must be a valid integer';
  } else if (!Number.isInteger(numDelta)) {
    errors.quantityDelta = 'Quantity delta must be a whole integer (no decimals)';
  } else if (numDelta === 0) {
    errors.quantityDelta = 'Quantity delta cannot be zero';
  } else if (numDelta < -100000 || numDelta > 100000) {
    errors.quantityDelta = 'Quantity delta magnitude must be between -100,000 and 100,000';
  } else if (
    numDelta < 0 &&
    typeof availableStock === 'number' &&
    !Number.isNaN(availableStock)
  ) {
    // Client-side guard: reduction cannot exceed available stock
    if (Math.abs(numDelta) > availableStock) {
      errors.quantityDelta = `Deduction magnitude (${Math.abs(numDelta)}) exceeds available stock (${availableStock})`;
    }
  }

  // 3. Validate Audit Reason
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  if (!trimmedReason) {
    errors.reason = 'An audit reason note is required';
  } else if (trimmedReason.length < 3) {
    errors.reason = 'Reason note must be at least 3 characters';
  } else if (trimmedReason.length > 500) {
    errors.reason = 'Reason note cannot exceed 500 characters';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    ...(isValid
      ? {
          parsedPayload: {
            productId: productId.trim(),
            quantityDelta: numDelta,
            reason: trimmedReason
          }
        }
      : {})
  };
}

/**
 * Validates date range filters for movements audit log queries
 *
 * @param {Object} params
 * @param {string} [params.startDate] - ISO 8601 date string
 * @param {string} [params.endDate] - ISO 8601 date string
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateMovementDateRange({ startDate, endDate } = {}) {
  if (!startDate || !endDate) {
    return { isValid: true };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime())) {
    return { isValid: false, error: 'Start date is not a valid date' };
  }

  if (Number.isNaN(end.getTime())) {
    return { isValid: false, error: 'End date is not a valid date' };
  }

  if (start > end) {
    return { isValid: false, error: 'Start date must be less than or equal to end date' };
  }

  return { isValid: true };
}

/**
 * Generates an RFC 4122 version 4 UUID string for request idempotency locking
 *
 * @returns {string} UUIDv4 string
 */
export function generateIdempotencyKey() {
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback RFC4122 v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
