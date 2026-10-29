import { ApiError } from './errors.js';

// Read API base URL from Vite environment or fall back to default backend port 5000
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');

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
 * Core HTTP request runner with envelope unwrapping and transparent silent token rotation
 */
export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});

  // Default to application/json if sending a JSON body
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
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

  // Handle 401 Unauthorized for protected routes (except login and refresh endpoints)
  const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh') || endpoint.includes('/auth/logout');
  if (response.status === 401 && !isAuthEndpoint && !options._isRetry) {
    try {
      // Trigger single-flight silent refresh using HttpOnly cookie
      const newAccessToken = await refreshAccessToken();

      // Retry original request with the fresh token
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

  // Unpack standard backend response envelope: { success: true, data: { ... } }
  return data?.data !== undefined ? data.data : data;
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
          'Content-Type': 'application/json'
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
        throw ApiError.fromResponse(json, res.status);
      }

      const newAccessToken = json?.data?.accessToken;
      if (!newAccessToken) {
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
      } finally {
        clearAccessToken();
        notifyAuthChange(null);
      }
    }
  }
};

