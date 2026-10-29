import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  formatNumber,
  calculatePercentage,
  formatDateTime,
  formatRelativeTime
} from '../src/lib/formatters.js';

test('formatCurrency formats integer cents to major currency unit', () => {
  assert.equal(formatCurrency(14892000, 'USD'), '$148,920.00');
  assert.equal(formatCurrency(28500, 'USD'), '$285.00');
  assert.equal(formatCurrency(0, 'USD'), '$0.00');
  assert.equal(formatCurrency(99, 'USD'), '$0.99');
});

test('formatCurrency handles fallback currencies and invalid currency codes gracefully', () => {
  assert.equal(formatCurrency(1000, 'EUR'), '€10.00');
  // Non-existent or invalid currency code should not throw
  const res = formatCurrency(5000, 'XYZ');
  assert.ok(res.includes('50.00'));
});

test('formatCurrency returns dash for invalid inputs', () => {
  assert.equal(formatCurrency(null), '—');
  assert.equal(formatCurrency(undefined), '—');
  assert.equal(formatCurrency(NaN), '—');
});

test('formatNumber formats counts with thousand separators', () => {
  assert.equal(formatNumber(1842), '1,842');
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(1000000), '1,000,000');
});

test('calculatePercentage handles normal and division-by-zero scenarios safely', () => {
  assert.equal(calculatePercentage(24, 1842), 1.3);
  assert.equal(calculatePercentage(1420, 1842), 77.1);
  assert.equal(calculatePercentage(0, 1842), 0);
  // Zero total
  assert.equal(calculatePercentage(10, 0), 0);
  assert.equal(calculatePercentage(0, 0), 0);
  assert.equal(calculatePercentage(null, 0), 0);
});

test('formatRelativeTime returns humanized relative duration', () => {
  const base = new Date('2026-10-30T12:00:00.000Z');

  const fiveMinsAgo = new Date('2026-10-30T11:55:00.000Z');
  assert.equal(formatRelativeTime(fiveMinsAgo, base), '5m ago');

  const twoHoursAgo = new Date('2026-10-30T10:00:00.000Z');
  assert.equal(formatRelativeTime(twoHoursAgo, base), '2h ago');

  const yesterday = new Date('2026-10-29T12:00:00.000Z');
  assert.equal(formatRelativeTime(yesterday, base), 'yesterday');
});

