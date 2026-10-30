import { apiClient } from '../../lib/apiClient.js';

export const orderApi = {
  /**
   * List orders across all customers with server-side filtering and pagination
   * Endpoint: GET /api/v1/admin/orders
   * Note: The backend sorts newest-first ({ createdAt: -1, _id: -1 }). No sort parameter is sent.
   */
  async getAdminOrders({
    page = 1,
    limit = 10,
    orderStatus,
    paymentStatus,
    paymentMethod,
    startDate,
    endDate,
    search
  } = {}) {
    const params = new URLSearchParams();

    if (page && Number(page) >= 1) {
      params.set('page', String(page));
    }
    if (limit && Number(limit) >= 1) {
      params.set('limit', String(Math.min(Number(limit), 100)));
    }
    if (orderStatus && orderStatus !== 'all') {
      params.set('orderStatus', orderStatus.trim());
    }
    if (paymentStatus && paymentStatus !== 'all') {
      params.set('paymentStatus', paymentStatus.trim());
    }
    if (paymentMethod && paymentMethod !== 'all') {
      params.set('paymentMethod', paymentMethod.trim());
    }
    if (startDate) {
      params.set('startDate', startDate);
    }
    if (endDate) {
      params.set('endDate', endDate);
    }
    if (search && search.trim()) {
      params.set('search', search.trim().slice(0, 100));
    }

    const queryStr = params.toString();
    const endpoint = `/admin/orders${queryStr ? `?${queryStr}` : ''}`;
    return apiClient.get(endpoint);
  },

  /**
   * Retrieve order details by reference with customer summary, payment, and audit logs
   * Endpoint: GET /api/v1/admin/orders/:reference
   */
  async getOrderByReference(reference) {
    if (!reference || typeof reference !== 'string') {
      throw new Error('Order reference string is required');
    }
    const cleanRef = reference.trim();
    return apiClient.get(`/admin/orders/${encodeURIComponent(cleanRef)}`);
  },

  /**
   * Advance order fulfillment status according to enforced backend lifecycle:
   * confirmed -> processing -> shipped -> delivered
   * Endpoint: PATCH /api/v1/admin/orders/:reference/status
   */
  async updateOrderStatus(reference, { status, tracking, codPaymentCollected } = {}) {
    if (!reference || typeof reference !== 'string') {
      throw new Error('Order reference string is required');
    }
    const cleanRef = reference.trim();

    const payload = { status };
    if (tracking && typeof tracking === 'object') {
      payload.tracking = tracking;
    }
    if (typeof codPaymentCollected === 'boolean') {
      payload.codPaymentCollected = codPaymentCollected;
    }

    return apiClient.patch(`/admin/orders/${encodeURIComponent(cleanRef)}/status`, payload);
  },

  /**
   * Cancel an eligible order by administrator with automatic inventory release
   * Endpoint: POST /api/v1/admin/orders/:reference/cancel
   */
  async cancelOrder(reference, { reason } = {}) {
    if (!reference || typeof reference !== 'string') {
      throw new Error('Order reference string is required');
    }
    const cleanRef = reference.trim();

    const payload = {};
    if (reason && typeof reason === 'string' && reason.trim()) {
      payload.reason = reason.trim();
    }

    return apiClient.post(`/admin/orders/${encodeURIComponent(cleanRef)}/cancel`, payload);
  }
};
