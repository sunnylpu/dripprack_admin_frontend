import { apiClient } from '../../lib/apiClient.js';

export const sectionApi = {
  /**
   * Get all storefront sections (optionally filtered by page or isActive)
   */
  async getSections({ page = 'home', isActive } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (isActive !== undefined) params.set('isActive', String(isActive));

    const queryStr = params.toString();
    const endpoint = `/sections${queryStr ? `?${queryStr}` : ''}`;
    const res = await apiClient.get(endpoint);
    return res?.sections || [];
  },

  /**
   * Get single section by ID
   */
  async getSectionById(id) {
    const res = await apiClient.get(`/sections/${id}`);
    return res?.section;
  },

  /**
   * Create new storefront section
   */
  async createSection(data) {
    const res = await apiClient.post('/sections', data);
    return res?.section;
  },

  /**
   * Update storefront section
   */
  async updateSection(id, data) {
    const res = await apiClient.patch(`/sections/${id}`, data);
    return res?.section;
  },

  /**
   * Toggle section visibility (isActive)
   */
  async toggleSectionStatus(id, isActive) {
    const res = await apiClient.patch(`/sections/${id}/toggle`, { isActive });
    return res?.section;
  },

  /**
   * Delete storefront section
   */
  async deleteSection(id) {
    return apiClient.delete(`/sections/${id}`);
  }
};

