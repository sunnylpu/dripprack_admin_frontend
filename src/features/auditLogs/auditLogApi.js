import { apiClient } from '../../lib/apiClient.js';

export const auditLogApi = {
  /**
   * Retrieve append-only administrative audit trail with filtering and pagination
   * Endpoint: GET /api/v1/admin/audit-logs
   * Note: The backend sorts newest-first ({ createdAt: -1, _id: -1 }). No sort parameter is sent.
   */
  async getAdminAuditLogs({
    page = 1,
    limit = 20,
    actor,
    action,
    resourceType,
    resourceId,
    startDate,
    endDate
  } = {}) {
    const params = new URLSearchParams();

    if (page && Number(page) >= 1) {
      params.set('page', String(page));
    }
    if (limit && Number(limit) >= 1) {
      params.set('limit', String(Math.min(Number(limit), 100)));
    }
    if (actor && typeof actor === 'string' && actor.trim()) {
      params.set('actor', actor.trim());
    }
    if (action && typeof action === 'string' && action.trim() && action !== 'ALL') {
      params.set('action', action.trim());
    }
    if (
      resourceType &&
      typeof resourceType === 'string' &&
      resourceType.trim() &&
      resourceType !== 'ALL'
    ) {
      params.set('resourceType', resourceType.trim());
    }
    if (resourceId && typeof resourceId === 'string' && resourceId.trim()) {
      params.set('resourceId', resourceId.trim().slice(0, 100));
    }
    if (startDate) {
      params.set('startDate', startDate);
    }
    if (endDate) {
      params.set('endDate', endDate);
    }

    const queryStr = params.toString();
    const endpoint = `/admin/audit-logs${queryStr ? `?${queryStr}` : ''}`;
    return apiClient.get(endpoint);
  }
};
