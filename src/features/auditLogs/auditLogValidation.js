/**
 * Validation rules and helpers for DripRack Security & System Audit Trail
 */

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Validates an optional actor MongoDB ObjectId
 *
 * @param {string} [actorId]
 * @returns {{ isValid: boolean, error?: string, parsedActor?: string }}
 */
export function validateActorId(actorId) {
  if (actorId === undefined || actorId === null || actorId === '') {
    return { isValid: true, parsedActor: undefined };
  }

  const trimmed = typeof actorId === 'string' ? actorId.trim() : '';
  if (!trimmed) {
    return { isValid: true, parsedActor: undefined };
  }

  if (!OBJECT_ID_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Actor ID must be a valid 24-character hexadecimal MongoDB ObjectId'
    };
  }

  return { isValid: true, parsedActor: trimmed };
}

/**
 * Validates date range for audit log queries
 *
 * @param {Object} range
 * @param {string} [range.startDate]
 * @param {string} [range.endDate]
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateAuditDateRange({ startDate, endDate } = {}) {
  if (!startDate || !endDate) {
    return { isValid: true };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime())) {
    return { isValid: false, error: 'Start date is not a valid date string' };
  }

  if (Number.isNaN(end.getTime())) {
    return { isValid: false, error: 'End date is not a valid date string' };
  }

  if (start > end) {
    return { isValid: false, error: 'Start date must be less than or equal to end date' };
  }

  return { isValid: true };
}

/**
 * Validates arbitrary string filter parameters (action, resourceType, resourceId)
 *
 * @param {string} [value]
 * @param {number} [maxLength=100]
 * @returns {{ isValid: boolean, error?: string, parsedValue?: string }}
 */
export function validateAuditFilterString(value, maxLength = 100) {
  if (value === undefined || value === null || value === '') {
    return { isValid: true, parsedValue: undefined };
  }

  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    return { isValid: true, parsedValue: undefined };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `Filter string cannot exceed ${maxLength} characters`
    };
  }

  return { isValid: true, parsedValue: trimmed };
}

/**
 * Safely sanitizes and structures MongoDB Mixed details for generic, XSS-safe rendering.
 * Does not assume any fixed schema.
 *
 * @param {*} details - Mixed details object, primitive, or array
 * @returns {Array<{ key: string, value: string, isObject: boolean, children?: any }>}
 */
export function structureMixedDetails(details) {
  if (details === null || details === undefined) {
    return [];
  }

  if (typeof details !== 'object') {
    return [{ key: 'value', value: String(details), isObject: false }];
  }

  if (Array.isArray(details)) {
    return details.map((item, index) => {
      if (item !== null && typeof item === 'object') {
        return {
          key: `[${index}]`,
          value: '',
          isObject: true,
          children: structureMixedDetails(item)
        };
      }
      return {
        key: `[${index}]`,
        value: item === null ? 'null' : String(item),
        isObject: false
      };
    });
  }

  return Object.entries(details).map(([key, val]) => {
    if (val !== null && typeof val === 'object') {
      return {
        key,
        value: '',
        isObject: true,
        children: structureMixedDetails(val)
      };
    }
    return {
      key,
      value: val === null ? 'null' : val === undefined ? 'undefined' : String(val),
      isObject: false
    };
  });
}
