import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCurrencyToCents, formatCentsToDecimalInput } from '../src/lib/formatters.js';

test('parseCurrencyToCents converts valid decimal string to integer cents', () => {
  assert.equal(parseCurrencyToCents('149.99'), 14999);
  assert.equal(parseCurrencyToCents('65.00'), 6500);
  assert.equal(parseCurrencyToCents('65'), 6500);
  assert.equal(parseCurrencyToCents('0.5'), 50);
  assert.equal(parseCurrencyToCents('0.05'), 5);
  assert.equal(parseCurrencyToCents('0'), 0);
  assert.equal(parseCurrencyToCents('0.00'), 0);
  assert.equal(parseCurrencyToCents('1000'), 100000);
});

test('parseCurrencyToCents rejects negative numbers, excessive decimal places, and malformed strings', () => {
  assert.throws(() => parseCurrencyToCents('-15.00'), /Invalid price format/);
  assert.throws(() => parseCurrencyToCents('19.999'), /Invalid price format/);
  assert.throws(() => parseCurrencyToCents('abc'), /Invalid price format/);
  assert.throws(() => parseCurrencyToCents('12.34.56'), /Invalid price format/);
  assert.throws(() => parseCurrencyToCents('$50'), /Invalid price format/);
  assert.throws(() => parseCurrencyToCents(''), /Price input is required/);
  assert.throws(() => parseCurrencyToCents(null), /Price input is required/);
});

test('formatCentsToDecimalInput converts cents to decimal representation', () => {
  assert.equal(formatCentsToDecimalInput(14999), '149.99');
  assert.equal(formatCentsToDecimalInput(6500), '65.00');
  assert.equal(formatCentsToDecimalInput(50), '0.50');
  assert.equal(formatCentsToDecimalInput(5), '0.05');
  assert.equal(formatCentsToDecimalInput(0), '0.00');
  assert.equal(formatCentsToDecimalInput(null), '');
  assert.equal(formatCentsToDecimalInput(undefined), '');
});

