import React from 'react';
import { PhasePlaceholderView } from './PhasePlaceholderView.jsx';

export function OrdersPlaceholder() {
  return (
    <PhasePlaceholderView
      title="Orders & Fulfillment Pipeline"
      phase="Phase 5"
      description="Administrative order fulfillment, order reference lookup, status transitions with tracking numbers, and cancellation with inventory release."
      plannedCapabilities={[
        'List all customer orders across the platform with filtering by status, paymentStatus, and pagination.',
        'Order detail lookup by reference with customer summary, payment status, and ordered items.',
        'Order status lifecycle transitions (pending, confirmed, processing, shipped, delivered) with carrier tracking numbers.',
        'Administrative order cancellation with automatic, exactly-once inventory release.'
      ]}
      backendEndpoints={[
        { method: 'GET', route: '/api/v1/admin/orders' },
        { method: 'GET', route: '/api/v1/admin/orders/:reference' },
        { method: 'PATCH', route: '/api/v1/admin/orders/:reference/status' },
        { method: 'POST', route: '/api/v1/admin/orders/:reference/cancel' }
      ]}
    />
  );
}
