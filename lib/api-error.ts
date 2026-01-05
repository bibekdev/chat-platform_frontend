import type { AxiosError } from 'axios';

// ============================================
// API ERROR TYPES
// ============================================

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: Record<string, unknown>;
}

// ============================================
// API ERROR CLASS
// ============================================

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: Record<string, unknown>,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isConflict(): boolean {
    return this.statusCode === 409;
  }

  get isValidationError(): boolean {
    return this.statusCode === 400 || this.statusCode === 422;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return new ApiError(
        status,
        data?.message || error.message || `HTTP Error ${status}`,
        data?.errors ?? (data as Record<string, unknown> | undefined),
        data?.error
      );
    }

    if (error.request) {
      // Request was made but no response received (network error)
      return new ApiError(0, 'Network error: Unable to reach server', undefined, 'NETWORK_ERROR');
    }

    // Request setup error
    return new ApiError(0, error.message || 'Request configuration error', undefined, 'REQUEST_ERROR');
  }

  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      details: this.details
    };
  }
}

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

/**
 * Check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

