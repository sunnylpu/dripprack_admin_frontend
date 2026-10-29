import { apiClient } from '../../lib/apiClient.js';
import { generateIdempotencyKey } from './inventoryValidation.js';

export const inventoryApi = {
  /**
   * List inventory stock across catalog products with search, filtering, and pagination
   * GET /api/v1/inventory/stock
   */
  async getStockList({
    page = 1,
    limit = 20,
    q,
    category,
    lowStockOnly,
    inStock,
    sortBy = 'createdAt:desc'
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    if (q && q.trim()) params.set('q', q.trim());
    if (category && category.trim() && category !== 'all') params.set('category', category.trim());
    if (lowStockOnly === true || lowStockOnly === 'true') params.set('lowStockOnly', 'true');
    if (inStock === 'true' || inStock === 'false') params.set('inStock', inStock);
    if (sortBy) params.set('sortBy', sortBy);

    const queryStr = params.toString();
    const endpoint = `/inventory/stock${queryStr ? `?${queryStr}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * List products currently at or below their low-stock replenishment threshold
   * GET /api/v1/inventory/low-stock
   */
  async getLowStock({
    page = 1,
    limit = 20,
    q,
    category,
    sortBy = 'available:asc'
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    if (q && q.trim()) params.set('q', q.trim());
    if (category && category.trim() && category !== 'all') params.set('category', category.trim());
    if (sortBy) params.set('sortBy', sortBy);

    const queryStr = params.toString();
    const endpoint = `/inventory/low-stock${queryStr ? `?${queryStr}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Retrieve immutable inventory movement audit log entries
   * GET /api/v1/inventory/movements
   */
  async getMovements({
    page = 1,
    limit = 20,
    productId,
    movementType,
    actor,
    startDate,
    endDate,
    sortBy = 'createdAt:desc'
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    if (productId && productId.trim()) params.set('productId', productId.trim());
    if (movementType && movementType !== 'all') params.set('movementType', movementType);
    if (actor && actor.trim()) params.set('actor', actor.trim());
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (sortBy) params.set('sortBy', sortBy);

    const queryStr = params.toString();
    const endpoint = `/inventory/movements${queryStr ? `?${queryStr}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Atomically adjust stock level for a product with idempotency protection
   * POST /api/v1/inventory/adjust
   */
  async adjustStock({ productId, quantityDelta, reason }, idempotencyKey = null) {
    const key = idempotencyKey || generateIdempotencyKey();
    const payload = {
      productId: String(productId).trim(),
      quantityDelta: Number(quantityDelta),
      reason: String(reason).trim()
    };

    return apiClient.post('/inventory/adjust', payload, {
      headers: {
        'Idempotency-Key': key
      }
    });
  }
};
