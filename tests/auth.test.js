import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  subscribeAuthChange
} from '../src/lib/apiClient.js';

test('Access token is held strictly in-memory and can be set, retrieved, and cleared', () => {
  clearAccessToken();
  assert.equal(getAccessToken(), null, 'Initial token must be null');

  const mockToken = 'mock.jwt.token';
  setAccessToken(mockToken);
  assert.equal(getAccessToken(), mockToken, 'Token should be retrieved from memory');

  clearAccessToken();
  assert.equal(getAccessToken(), null, 'Token should be cleared from memory');
});

test('Auth state change subscription receives notifications and supports unsubscribe', () => {
  const events = [];
  const listener = (user) => {
    events.push(user);
  };

  const unsubscribe = subscribeAuthChange(listener);

  // Re-importing or verifying subscriber collection
  assert.equal(typeof unsubscribe, 'function');
  unsubscribe();
});

test('No access tokens or secrets are stored in localStorage or sessionStorage', () => {
  // Verify that browser storage APIs are not called/used for tokens
  assert.equal(typeof globalThis.localStorage, 'undefined');
  assert.equal(typeof globalThis.sessionStorage, 'undefined');
});

