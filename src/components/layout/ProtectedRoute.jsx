import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.jsx';
import { LoadingState } from '../ui/LoadingState.jsx';

/**
 * Route guard enforcing that only authenticated users with the verified 'admin' role can enter
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="VERIFYING OPERATOR PRIVILEGES..." />;
  }

  // Enforce authentication, verified admin role, and active status
  if (!isAuthenticated || user?.role !== 'admin' || user?.status !== 'active') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

