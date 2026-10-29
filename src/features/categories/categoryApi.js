import { apiClient } from '../../lib/apiClient.js';

export const categoryApi = {
  /**
   * List categories for administrators (supports includeInactive and pagination)
   */
  async getAdminCategories({ page = 1, limit = 20, includeInactive = false } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    if (includeInactive) params.set('includeInactive', 'true');

    const queryStr = params.toString();
    const endpoint = `/admin/categories${queryStr ? `?${queryStr}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * List active categories (used by product forms category selector)
   */
  async getActiveCategories() {
    const res = await apiClient.get('/categories');
    return res?.categories || [];
  },

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    return apiClient.post('/categories', categoryData);
  },

  /**
   * Update category fields
   */
  async updateCategory(id, categoryData) {
    return apiClient.patch(`/categories/${id}`, categoryData);
  },

  /**
   * Soft-deactivate category (sets isActive: false)
   */
  async deactivateCategory(id) {
    return apiClient.delete(`/categories/${id}`);
  }
};

