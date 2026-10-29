import React from 'react';
import { PhasePlaceholderView } from './PhasePlaceholderView.jsx';

export function InventoryPlaceholder() {
  return (
    <PhasePlaceholderView
      title="Inventory & Stock Movements"
      phase="Phase 4"
      description="Stock level auditing, manual restock adjustments, reserved inventory inspection, and low-stock alerts."
      plannedCapabilities={[
        'SKU-level stock tracking with physical warehouse location mapping.',
        'Reserved stock vs available stock reconciliation for active checkouts.',
        'Manual stock adjustments with mandatory audit reason logging (restock, damage, loss).',
        'Low stock threshold notifications and automated reorder triggers.'
      ]}
      backendEndpoints={[
        { method: 'GET', route: '/api/v1/inventory' },
        { method: 'POST', route: '/api/v1/inventory/adjust' },
        { method: 'GET', route: '/api/v1/inventory/movements' },
        { method: 'GET', route: '/api/v1/inventory/low-stock' }
      ]}
    />
  );
}

