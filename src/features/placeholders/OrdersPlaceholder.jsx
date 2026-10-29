import React from 'react';
import { PhasePlaceholderView } from './PhasePlaceholderView.jsx';

export function OrdersPlaceholder() {
  return (
    <PhasePlaceholderView
      title="Orders & Fulfillment Pipeline"
      phase="Phase 2"
      description="Live order tracking, state transitions (pending, confirmed, processing, shipped, delivered), and carrier dispatch tracking."
      plannedCapabilities={[
        'Full administrative listing of customer orders with pagination, date filtering, and status tabs.',
        'Order status lifecycle transitions: pending → confirmed → processing → shipped → delivered.',
        'Carrier tracking number assignment with automated customer notification triggers.',
        'Cancellation and refund initiation with inventory restock reconciliation.'
      ]}
      backendEndpoints={[
        { method: 'GET', route: '/api/v1/orders' },
        { method: 'GET', route: '/api/v1/orders/:id' },
        { method: 'PATCH', route: '/api/v1/orders/:id/status' },
        { method: 'POST', route: '/api/v1/orders/:id/ship' }
      ]}
    />
  );
}

