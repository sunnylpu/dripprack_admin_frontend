import React from 'react';
import { PhasePlaceholderView } from './PhasePlaceholderView.jsx';

export function CategoriesPlaceholder() {
  return (
    <PhasePlaceholderView
      title="Category Taxonomy Management"
      phase="Phase 3"
      description="Category management, unique slug generation, category descriptions, and active status toggling."
      plannedCapabilities={[
        'Admin category listing supporting active and inactive categories with pagination.',
        'Category creation with name, unique lowercase slug, and optional description.',
        'Category catalog field updates (name, slug, description).',
        'Category soft-deactivation via deletion endpoint (toggles active status).'
      ]}
      backendEndpoints={[
        { method: 'GET', route: '/api/v1/admin/categories' },
        { method: 'POST', route: '/api/v1/categories' },
        { method: 'PATCH', route: '/api/v1/categories/:id' },
        { method: 'DELETE', route: '/api/v1/categories/:id' },
        { method: 'GET', route: '/api/v1/categories' },
        { method: 'GET', route: '/api/v1/categories/:id' }
      ]}
    />
  );
}
