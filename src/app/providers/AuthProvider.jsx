import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, clearAccessToken, subscribeAuthChange } from '../../lib/apiClient.js';
import { ApiError } from '../../lib/errors.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Guards against duplicate session restorations in React Strict Mode & stale async updates
  const restorePromiseRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Restore existing session using the backend's HttpOnly refresh cookie.
   * Single-flight execution prevents duplicate calls in development or simultaneous mounts.
   */
  const restoreSession = useCallback(async () => {
    if (restorePromiseRef.current) {
      return restorePromiseRef.current;
    }

    const promise = (async () => {
      try {
        // Attempt silent refresh via HttpOnly cookie
        await apiClient.auth.refresh();

        // Fetch verified profile from /auth/me to confirm current role and active status
        const meRes = await apiClient.auth.getMe();
        const currentUser = meRes?.user;

        // Verify both admin role and active account status
        if (currentUser?.role === 'admin' && currentUser?.status === 'active') {
          if (isMountedRef.current) {
            setUser(currentUser);
          }
        } else {
          // Inactive account or unauthorized role: invalidate server cookie & local state
          try {
            await apiClient.auth.logout();
          } catch {
            // Suppress logout errors
          }
          clearAccessToken();
          if (isMountedRef.current) {
            setUser(null);
          }
        }
      } catch {
        // Expired cookie, network failure, or unauthenticated session
        clearAccessToken();
        if (isMountedRef.current) {
          setUser(null);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        restorePromiseRef.current = null;
      }
    })();

    restorePromiseRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    restoreSession();

    // Listen for unexpected auth changes (e.g. background 401 on refresh expiration)
    const unsubscribe = subscribeAuthChange((updatedUser) => {
      if (!isMountedRef.current) return;
      if (!updatedUser || updatedUser.role !== 'admin' || updatedUser.status !== 'active') {
        setUser(null);
      } else {
        setUser(updatedUser);
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [restoreSession]);

  /**
   * Log in operator and enforce strict admin role and active account verification
   */
  const login = async ({ email, password }) => {
    const res = await apiClient.auth.login({ email, password });
    const authenticatedUser = res?.user;

    // Strict role check: Non-admin roles cannot enter the administrative portal
    if (authenticatedUser?.role !== 'admin') {
      try {
        await apiClient.auth.logout();
      } catch {
        // Suppress logout error
      }
      clearAccessToken();
      setUser(null);
      throw new ApiError('Access Denied: Administrator role required to access the admin portal.', {
        code: 'FORBIDDEN_ROLE',
        status: 403
      });
    }

    // Active status check: Suspended or deactivated admins cannot enter
    if (authenticatedUser?.status !== 'active') {
      try {
        await apiClient.auth.logout();
      } catch {
        // Suppress logout error
      }
      clearAccessToken();
      setUser(null);
      throw new ApiError('Access Denied: Administrator account is not active.', {
        code: 'ACCOUNT_INACTIVE',
        status: 403
      });
    }

    setUser(authenticatedUser);
    return authenticatedUser;
  };

  /**
   * Log out operator and purge all in-memory tokens
   */
  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } catch {
      // Suppress network or server errors during logout so local purge is guaranteed
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user && user.role === 'admin' && user.status === 'active'),
    isLoading,
    login,
    logout,
    restoreSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
