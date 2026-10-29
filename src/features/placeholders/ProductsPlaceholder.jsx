import React from 'react';
import { PhasePlaceholderView } from './PhasePlaceholderView.jsx';

export function ProductsPlaceholder() {
  return (
    <PhasePlaceholderView
      title="Products Catalog & Matrix"
      phase="Phase 3"
      description="Manage SKU hierarchies, product variants (size/color), image galleries, and pricing rules."
      plannedCapabilities={[
        'Full product CRUD with multi-variant matrices (SKU generation, barcode, attributes).',
        'Image asset management with primary thumbnail assignment and cloud upload support.',
        'Pricing rules, base prices, discount thresholds, and promotional status toggles.',
        'Category association and tag taxonomy assignment.'
      ]}
      backendEndpoints={[
        { method: 'GET', route: '/api/v1/products' },
        { method: 'POST', route: '/api/v1/products' },
        { method: 'PUT', route: '/api/v1/products/:id' },
        { method: 'DELETE', route: '/api/v1/products/:id' }
      ]}
    />
  );
}

