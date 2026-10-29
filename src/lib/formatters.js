/**
 * Currency, date, and math formatting helpers for DripRack administrative UI
 */

/**
 * Formats integer cents into a localized major currency string.
 * Converts integer minor units to major currency units exactly once.
 *
 * @param {number} cents - Integer minor unit (e.g. 14892000 for $148,920.00)
 * @param {string} [currency='USD'] - ISO 4217 currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(cents, currency = 'USD') {
  if (typeof cents !== 'number' || Number.isNaN(cents)) {
    return '—';
  }

  const safeCurrency = (typeof currency === 'string' && currency.trim()) ? currency.trim().toUpperCase() : 'USD';
  const majorUnits = cents / 100;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(majorUnits);
  } catch {
    // Fallback for non-standard or unsupported currency codes
    return `${safeCurrency} ${majorUnits.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}

/**
 * Formats integer count with comma separators.
 *
 * @param {number} count
 * @returns {string}
 */
export function formatNumber(count) {
  if (typeof count !== 'number' || Number.isNaN(count)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US').format(count);
}

/**
 * Calculates percentage safely without dividing by zero.
 *
 * @param {number} count
 * @param {number} total
 * @param {number} [decimals=1]
 * @returns {number}
 */
export function calculatePercentage(count, total, decimals = 1) {
  if (!total || typeof total !== 'number' || total <= 0) {
    return 0;
  }
  if (!count || typeof count !== 'number' || count < 0) {
    return 0;
  }
  const pct = (count / total) * 100;
  return Number(pct.toFixed(decimals));
}

/**
 * Formats an ISO date string into a localized tactical date-time format.
 *
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Formats an ISO date string into a relative time description (e.g. "8m ago", "2h ago", "yesterday").
 *
 * @param {string|Date} dateInput
 * @param {Date} [now=new Date()]
 * @returns {string}
 */
export function formatRelativeTime(dateInput, now = new Date()) {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'just now';

  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDateTime(dateInput);
}

