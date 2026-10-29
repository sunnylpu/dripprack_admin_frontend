import React from 'react';
import { PhasePlaceholderView } from './PhasePlaceholderView.jsx';

export function InventoryPlaceholder() {
  return (
    <PhasePlaceholderView
      title="Inventory & Stock Movements"
      phase="Phase 4"
      description="Stock level auditing, atomic stock adjustments, low-stock threshold queries, and immutable movement history."
      plannedCapabilities={[
        'SKU-level stock overview displaying physical, reserved, and available stock per product.',
        'Low-stock query identifying products where available stock is at or below threshold.',
        'Atomic stock adjustment with reason notes (restock, physical_audit, damage, loss, return_restock).',
        'Immutable audit log of stock movements with quantity deltas, timestamps, and actor references.'
      ]}
      backendEndpoints={[
        { method: 'GET', route: '/api/v1/inventory/stock' },
        { method: 'GET', route: '/api/v1/inventory/low-stock' },
        { method: 'GET', route: '/api/v1/inventory/movements' },
        { method: 'POST', route: '/api/v1/inventory/adjust' }
      ]}
    />
  );
}
