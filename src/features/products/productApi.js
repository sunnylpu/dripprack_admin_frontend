import { apiClient } from '../../lib/apiClient.js';

export const productApi = {
  /**
   * List products for administrators with full filtering, search, sorting and server pagination
   */
  async getAdminProducts({
    page = 1,
    limit = 20,
    q,
    category,
    status,
    inStock,
    sortBy = 'createdAt:desc'
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    if (q && q.trim()) params.set('q', q.trim());
    if (category && category.trim()) params.set('category', category.trim());
    if (status && status !== 'all') params.set('status', status);
    if (inStock === 'true' || inStock === 'false') params.set('inStock', inStock);
    if (sortBy) params.set('sortBy', sortBy);

    const queryStr = params.toString();
    const endpoint = `/admin/products${queryStr ? `?${queryStr}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Get single product detail by ID (including draft and archived items)
   */
  async getAdminProductById(id) {
    const res = await apiClient.get(`/admin/products/${id}`);
    return res?.product || res;
  },

  /**
   * Create a new product (catalog fields only, no stock mutations)
   */
  async createProduct(productData) {
    return apiClient.post('/products', productData);
  },

  /**
   * Update existing product catalog fields
   */
  async updateProduct(id, productData) {
    return apiClient.patch(`/products/${id}`, productData);
  },

  /**
   * Transition product lifecycle status (draft, published, archived)
   */
  async updateProductStatus(id, status) {
    return apiClient.patch(`/products/${id}/status`, { status });
  }
};

