import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, clearAccessToken, subscribeAuthChange } from '../../lib/apiClient.js';
import { ApiError } from '../../lib/errors.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restore existing session using the backend's HttpOnly refresh cookie
   */
  const restoreSession = useCallback(async () => {
    try {
      // Attempt silent refresh via HttpOnly cookie
      await apiClient.auth.refresh();
      // Fetch verified profile from /auth/me to ensure user status and role are fresh
      const meRes = await apiClient.auth.getMe();
      const currentUser = meRes?.user;

      if (currentUser?.role === 'admin' && currentUser?.status === 'active') {
        setUser(currentUser);
      } else {
        // Not an admin or not active: clear session
        await apiClient.auth.logout();
        setUser(null);
      }
    } catch {
      // No active session or expired cookie
      setUser(null);
      clearAccessToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();

    // Listen for unexpected auth invalidations (e.g. background 401 on refresh failure)
    const unsubscribe = subscribeAuthChange((updatedUser) => {
      if (!updatedUser) {
        setUser(null);
      } else if (updatedUser.role === 'admin') {
        setUser(updatedUser);
      }
    });

    return unsubscribe;
  }, [restoreSession]);

  /**
   * Log in operator and enforce strict admin role verification
   */
  const login = async ({ email, password }) => {
    const res = await apiClient.auth.login({ email, password });
    const authenticatedUser = res?.user;

    // Strict role check: Customers cannot access the admin control plane
    if (authenticatedUser?.role !== 'admin') {
      // Immediately revoke session cookie issued by backend
      try {
        await apiClient.auth.logout();
      } catch {
        // Ignore logout error
      }
      setUser(null);
      throw new ApiError('Access Denied: Administrator role required to access the admin portal.', {
        code: 'FORBIDDEN_ROLE',
        status: 403
      });
    }

    if (authenticatedUser?.status !== 'active') {
      try {
        await apiClient.auth.logout();
      } catch {
        // Ignore logout error
      }
      setUser(null);
      throw new ApiError('Access Denied: Administrator account is suspended or deactivated.', {
        code: 'ACCOUNT_INACTIVE',
        status: 403
      });
    }

    setUser(authenticatedUser);
    return authenticatedUser;
  };

  /**
   * Log out operator and clear all in-memory credentials
   */
  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user && user.role === 'admin'),
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

