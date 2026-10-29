/**
 * Normalized API error class representing backend response errors
 */
export class ApiError extends Error {
  constructor(message, { code = 'UNKNOWN_ERROR', status = 500, details = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /**
   * Factory constructor from parsed backend error response
   */
  static fromResponse(data, status) {
    const errorObj = data?.error || {};
    const message = errorObj.message || data?.message || 'An unexpected error occurred';
    const code = errorObj.code || 'API_ERROR';
    const details = Array.isArray(errorObj.details) ? errorObj.details : [];
    return new ApiError(message, { code, status, details });
  }

  /**
   * Factory for network or connectivity failures
   */
  static networkError(originalError) {
    return new ApiError(
      'Unable to connect to the DripRack API server. Please verify your connection or backend process.',
      {
        code: 'NETWORK_ERROR',
        status: 0,
        details: [originalError?.message].filter(Boolean)
      }
    );
  }
}

