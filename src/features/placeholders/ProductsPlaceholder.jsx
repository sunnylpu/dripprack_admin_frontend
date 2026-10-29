import React from 'react';
import { PhasePlaceholderView } from './PhasePlaceholderView.jsx';

export function ProductsPlaceholder() {
  return (
    <PhasePlaceholderView
      title="Products Catalog Management"
      phase="Phase 3"
      description="Product catalog CRUD, pricing in cents, SKU lookup, image URLs, and status lifecycle (draft, published, archived)."
      plannedCapabilities={[
        'Admin product listing supporting status filters (draft, published, archived) and pagination.',
        'Admin product detail lookup by ID (including draft and archived items).',
        'Product creation with SKU, name, description, category ID, price in cents, and image URLs.',
        'Product catalog field updates (name, description, priceCents, compareAtPriceCents).',
        'Product lifecycle status updates (draft, published, archived).'
      ]}
      backendEndpoints={[
        { method: 'GET', route: '/api/v1/admin/products' },
        { method: 'GET', route: '/api/v1/admin/products/:id' },
        { method: 'POST', route: '/api/v1/products' },
        { method: 'PATCH', route: '/api/v1/products/:id' },
        { method: 'PATCH', route: '/api/v1/products/:id/status' },
        { method: 'GET', route: '/api/v1/products' },
        { method: 'GET', route: '/api/v1/products/:idOrSlug' }
      ]}
    />
  );
}
