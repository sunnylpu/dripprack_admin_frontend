import { ApiError } from './errors.js';

// Read API base URL from Vite environment, process.env, or fall back to default backend port 5000
const rawBaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
  'http://localhost:5000/api/v1';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

// Short-lived access token kept strictly in application memory
let inMemoryAccessToken = null;

// Single-flight promise queue to prevent multiple concurrent refresh calls
let refreshPromise = null;

// Auth state change listeners (e.g. for session expiration redirect)
const authListeners = new Set();

export function getAccessToken() {
  return inMemoryAccessToken;
}

export function setAccessToken(token) {
  inMemoryAccessToken = token;
}

export function clearAccessToken() {
  inMemoryAccessToken = null;
}

export function subscribeAuthChange(listener) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function notifyAuthChange(user) {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error in auth change listener:', err);
    }
  });
}

/**
 * Normalizes standard backend ApiResponse envelopes:
 * - Unpacks payload.data
 * - Preserves top-level payload.meta alongside data object for paginated lists
 */
export function normalizeApiResponse(payload) {
  if (payload && typeof payload === 'object' && payload.data !== undefined) {
    if (
      payload.meta !== undefined &&
      typeof payload.data === 'object' &&
      payload.data !== null &&
      !Array.isArray(payload.data)
    ) {
      return {
        ...payload.data,
        meta: payload.meta
      };
    }
    return payload.data;
  }
  return payload;
}

/**
 * Core HTTP request runner with envelope unwrapping and transparent silent token rotation
 */
export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});

  // Default to application/json if sending a JSON body
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach client identity header to enforce admin session isolation
  if (!headers.has('X-App-Client')) {
    headers.set('X-App-Client', 'admin');
  }

  // Attach in-memory Bearer access token if present
  if (inMemoryAccessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  const fetchOptions = {
    ...options,
    headers,
    // Always include credentials so the browser sends/receives HttpOnly refresh cookies
    credentials: 'include'
  };

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    throw ApiError.networkError(err);
  }

  // Handle 401 Unauthorized for protected routes (except auth endpoints)
  // Dedicated customer/admin auth aliases are also terminal auth operations.
  // Never attempt refresh/replay after a failed login, refresh, or logout request.
  const isAuthEndpoint = /\/auth\/(?:admin\/|customer\/)?(?:login|refresh|logout)(?:[?#]|$)/.test(endpoint);
  if (response.status === 401 && !isAuthEndpoint && !options._isRetry) {
    const method = (options.method || 'GET').toUpperCase();
    const isIdempotent = ['GET', 'HEAD', 'OPTIONS'].includes(method);

    if (isIdempotent) {
      try {
        // Trigger single-flight silent refresh using HttpOnly cookie
        const newAccessToken = await refreshAccessToken();

        // Retry original idempotent read request with the fresh token
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        return await request(endpoint, {
          ...options,
          headers,
          _isRetry: true
        });
      } catch (refreshErr) {
        clearAccessToken();
        notifyAuthChange(null);
        throw refreshErr;
      }
    } else {
      // Non-idempotent mutation (POST, PATCH, DELETE, PUT):
      // Attempt silent refresh to restore token for next requests,
      // but never automatically replay mutations to prevent duplicate side effects.
      try {
        await refreshAccessToken();
      } catch {
        clearAccessToken();
        notifyAuthChange(null);
      }

      let errorData;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          errorData = null;
        }
      }
      throw ApiError.fromResponse(errorData, response.status);
    }
  }

  // Parse response envelope
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw ApiError.fromResponse(data, response.status);
  }

  // Unpack standard backend response envelope while preserving top-level meta for paginated datasets
  return normalizeApiResponse(data);
}

/**
 * Single-flight session refresh via backend's HttpOnly cookie
 */
async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Client': 'admin'
        },
        credentials: 'include'
      });

      let json;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        clearAccessToken();
        notifyAuthChange(null);
        throw ApiError.fromResponse(json, res.status);
      }

      const newAccessToken = json?.data?.accessToken;
      if (!newAccessToken) {
        clearAccessToken();
        notifyAuthChange(null);
        throw new ApiError('No access token received during session refresh', { code: 'TOKEN_REFRESH_FAILED' });
      }

      setAccessToken(newAccessToken);
      notifyAuthChange(json?.data?.user || null);
      return newAccessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Centralized API client methods
 */
export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),

  // Authentication operations
  auth: {
    async login({ email, password }) {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res?.accessToken) {
        setAccessToken(res.accessToken);
      }

      return res;
    },

    async refresh() {
      return refreshAccessToken();
    },

    async getMe() {
      return request('/auth/me', { method: 'GET' });
    },

    async logout() {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch {
        // Suppress network/server errors so local state is unconditionally purged
      } finally {
        clearAccessToken();
        notifyAuthChange(null);
      }
    }
  }
};

