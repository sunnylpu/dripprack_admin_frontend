/**
 * Validation rules and state transition checks for DripRack Orders & Fulfillment
 */

const HTTPS_URL_REGEX = /^https:\/\/[^\s$.?#].[^\s]*$/i;

export const ORDER_STATUSES = [
  'awaiting_payment',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded',
  'cod_due'
];

export const PAYMENT_METHODS = ['cod', 'online'];

/**
 * Validates shipping tracking payload for transitioning an order to 'shipped'
 *
 * @param {Object} tracking
 * @param {string} tracking.carrier
 * @param {string} tracking.trackingNumber
 * @param {string} tracking.trackingUrl
 * @returns {{ isValid: boolean, errors: Record<string, string>, parsedPayload?: { carrier: string, trackingNumber: string, trackingUrl: string } }}
 */
export function validateTracking(tracking = {}) {
  const errors = {};

  const carrier = typeof tracking?.carrier === 'string' ? tracking.carrier.trim() : '';
  if (!carrier) {
    errors.carrier = 'Carrier name is required';
  } else if (carrier.length < 2) {
    errors.carrier = 'Carrier name must be at least 2 characters';
  } else if (carrier.length > 100) {
    errors.carrier = 'Carrier name cannot exceed 100 characters';
  }

  const trackingNumber = typeof tracking?.trackingNumber === 'string' ? tracking.trackingNumber.trim() : '';
  if (!trackingNumber) {
    errors.trackingNumber = 'Tracking number is required';
  } else if (trackingNumber.length < 3) {
    errors.trackingNumber = 'Tracking number must be at least 3 characters';
  } else if (trackingNumber.length > 100) {
    errors.trackingNumber = 'Tracking number cannot exceed 100 characters';
  }

  const trackingUrl = typeof tracking?.trackingUrl === 'string' ? tracking.trackingUrl.trim() : '';
  if (!trackingUrl) {
    errors.trackingUrl = 'Tracking URL is required';
  } else if (!HTTPS_URL_REGEX.test(trackingUrl)) {
    errors.trackingUrl = 'Tracking URL must be a valid URL using secure HTTPS (e.g. https://carrier.com/track/123)';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    ...(isValid
      ? {
          parsedPayload: {
            carrier,
            trackingNumber,
            trackingUrl
          }
        }
      : {})
  };
}

/**
 * Validates optional administrative cancellation reason (3-500 characters when provided)
 *
 * @param {string} [reason]
 * @returns {{ isValid: boolean, error?: string, parsedReason?: string }}
 */
export function validateCancelReason(reason) {
  if (reason === undefined || reason === null || reason === '') {
    return { isValid: true, parsedReason: undefined };
  }

  const trimmed = typeof reason === 'string' ? reason.trim() : '';
  if (!trimmed) {
    return { isValid: true, parsedReason: undefined };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Cancellation reason must be at least 3 characters' };
  }

  if (trimmed.length > 500) {
    return { isValid: false, error: 'Cancellation reason cannot exceed 500 characters' };
  }

  return { isValid: true, parsedReason: trimmed };
}

/**
 * Determines whether an order can transition to a target status according to backend lifecycle rules:
 * confirmed -> processing -> shipped -> delivered
 *
 * @param {Object} order
 * @param {string} targetStatus
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function checkOrderTransitionEligibility(order, targetStatus) {
  if (!order || !order.orderStatus) {
    return { allowed: false, reason: 'Invalid order record' };
  }

  const currentStatus = order.orderStatus;

  // Terminal states cannot be changed
  if (currentStatus === 'cancelled') {
    return { allowed: false, reason: 'Cancelled orders cannot be reopened or fulfilled' };
  }
  if (currentStatus === 'delivered') {
    return { allowed: false, reason: 'Delivered orders have completed their lifecycle' };
  }

  // Awaiting payment cannot be manually advanced
  if (currentStatus === 'awaiting_payment') {
    return {
      allowed: false,
      reason: 'Orders awaiting payment cannot be advanced manually by administrator'
    };
  }

  // Online orders must have verified payment before fulfillment
  if (order.paymentMethod === 'online' && order.paymentStatus !== 'paid') {
    return {
      allowed: false,
      reason: 'Online orders must have verified payment (paid) before fulfillment'
    };
  }

  // Sequential transition rules
  const nextMap = {
    confirmed: 'processing',
    processing: 'shipped',
    shipped: 'delivered'
  };

  const expectedTarget = nextMap[currentStatus];
  if (expectedTarget !== targetStatus) {
    return {
      allowed: false,
      reason: `Invalid transition from "${currentStatus}" to "${targetStatus}". Enforced flow: confirmed -> processing -> shipped -> delivered`
    };
  }

  return { allowed: true };
}

/**
 * Determines whether an order is eligible for administrative cancellation
 *
 * @param {Object} order
 * @returns {{ cancellable: boolean, reason?: string }}
 */
export function checkOrderCancellationEligibility(order) {
  if (!order || !order.orderStatus) {
    return { cancellable: false, reason: 'Invalid order record' };
  }

  if (order.orderStatus === 'cancelled') {
    return { cancellable: false, reason: 'Order is already cancelled' };
  }

  if (['shipped', 'delivered'].includes(order.orderStatus)) {
    return {
      cancellable: false,
      reason: `Orders in "${order.orderStatus}" status cannot be cancelled`
    };
  }

  if (order.paymentStatus === 'paid') {
    return {
      cancellable: false,
      reason: 'Paid orders cannot be automatically cancelled because refund processing is not supported'
    };
  }

  if (!['awaiting_payment', 'confirmed', 'processing'].includes(order.orderStatus)) {
    return {
      cancellable: false,
      reason: `Order status "${order.orderStatus}" is not eligible for cancellation`
    };
  }

  return { cancellable: true };
}

/**
 * Validates date range for order queries
 *
 * @param {Object} range
 * @param {string} [range.startDate]
 * @param {string} [range.endDate]
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateOrderDateRange({ startDate, endDate } = {}) {
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
