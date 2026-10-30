import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute.jsx';
import { AdminLayout } from '../components/layout/AdminLayout.jsx';
import { LoginView } from '../features/auth/LoginView.jsx';
import { DashboardView } from '../features/dashboard/DashboardView.jsx';
import { ProductsView } from '../features/products/ProductsView.jsx';
import { CategoriesView } from '../features/categories/CategoriesView.jsx';
import { InventoryView } from '../features/inventory/InventoryView.jsx';
import { OrdersView } from '../features/orders/OrdersView.jsx';
import { AuditLogsPlaceholder } from '../features/placeholders/AuditLogsPlaceholder.jsx';

export function AppRouter() {
  return (
    <Routes>
      {/* Standalone Authentication Gateway */}
      <Route path="/login" element={<LoginView />} />

      {/* Protected Tactical Admin Domain */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/products" element={<ProductsView />} />
        <Route path="/categories" element={<CategoriesView />} />
        <Route path="/orders" element={<OrdersView />} />
        <Route path="/inventory" element={<InventoryView />} />
        <Route path="/audit-logs" element={<AuditLogsPlaceholder />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

