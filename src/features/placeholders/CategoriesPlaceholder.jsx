import React from 'react';
import { PhasePlaceholderView } from './PhasePlaceholderView.jsx';

export function CategoriesPlaceholder() {
  return (
    <PhasePlaceholderView
      title="Category Taxonomy Hierarchy"
      phase="Phase 3"
      description="Hierarchical category tree structure, slug generation, parent-child relations, and catalog sorting."
      plannedCapabilities={[
        'Interactive tree view of top-level categories and subcategories.',
        'Slug uniqueness validation and SEO metadata configuration.',
        'Drag-and-drop category reordering and parent reassignment.',
        'Product counts per category with cascading deletion protection.'
      ]}
      backendEndpoints={[
        { method: 'GET', route: '/api/v1/categories' },
        { method: 'POST', route: '/api/v1/categories' },
        { method: 'PUT', route: '/api/v1/categories/:id' },
        { method: 'DELETE', route: '/api/v1/categories/:id' }
      ]}
    />
  );
}

