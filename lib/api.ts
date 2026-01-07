import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import type { z } from 'zod';

import { ApiError, ApiErrorResponse, getErrorMessage, isApiError } from './api-error';
import { getCookie, setCookie } from './utils';

// ============================================
// CONFIGURATION
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// ============================================
// TOKEN MANAGEMENT (Client-side only)
// ============================================

// For client-side requests - token is in HttpOnly cookie, sent automatically
// This is only used for non-cookie scenarios (e.g., WebSocket auth)
let clientAccessToken: string | null = null;

export function setClientAccessToken(token: string | null) {
  clientAccessToken = token;
}

export function getClientAccessToken(): string | null {
  return clientAccessToken;
}

// ============================================
// TYPES
// ============================================

interface FetchOptions extends Omit<AxiosRequestConfig, 'url' | 'method'> {
  skipAuth?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  before?: string;
  after?: string;
  limit?: number;
}

// ============================================
// AXIOS INSTANCE FACTORY
// ============================================

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getCookie('chat_refreshToken');
    if (!refreshToken) {
      return false;
    }
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    // Backend returns tokens directly, not wrapped in a 'tokens' property
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
    setCookie('chat_accessToken', accessToken, {
      expires: new Date(Date.now() + expiresIn * 1000)
    });
    setCookie('chat_refreshToken', newRefreshToken);
    return response.status === 200 || response.status === 201;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error(
      '[Token Refresh Error]',
      axiosError.response?.data || axiosError.message
    );
    return false;
  }
}

function createClientAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true, // Include cookies for refresh token
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add Authorization header from cookie if available
      const skipAuth = (config as InternalAxiosRequestConfig & { skipAuth?: boolean })
        .skipAuth;
      if (!skipAuth) {
        const token = getCookie('chat_accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Log requests in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    },
    (error: AxiosError<ApiErrorResponse>) => {
      console.error('[API Request Error]', error.message);
      return Promise.reject(ApiError.fromAxiosError(error));
    }
  );

  // Response interceptor with token refresh
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log responses in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
      }
      return response;
    },
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        skipAuth?: boolean;
      };

      // Handle 401 errors with token refresh
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.skipAuth
      ) {
        if (isRefreshing) {
          // Queue this request until token is refreshed
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              // Retry with new token
              const token = getCookie('chat_accessToken');
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            processQueue(null);
            // Retry the original request
            const token = getCookie('chat_accessToken');
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          } else {
            processQueue(new Error('Token refresh failed'));
            return Promise.reject(
              new ApiError(
                401,
                'Unauthorized - Token refresh failed',
                undefined,
                'UNAUTHORIZED'
              )
            );
          }
        } catch (refreshError) {
          processQueue(refreshError as Error);
          return Promise.reject(
            new ApiError(401, 'Unauthorized', undefined, 'UNAUTHORIZED')
          );
        } finally {
          isRefreshing = false;
        }
      }

      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `[API Error] ${error.response?.status || 'Network'} ${error.config?.url}:`,
          error.response?.data || error.message
        );
      }

      return Promise.reject(ApiError.fromAxiosError(error));
    }
  );

  return instance;
}

// Singleton instance for client-side requests
let clientAxiosInstance: AxiosInstance | null = null;

function getClientAxiosInstance(): AxiosInstance {
  if (!clientAxiosInstance) {
    clientAxiosInstance = createClientAxiosInstance();
  }
  return clientAxiosInstance;
}

// ============================================
// BASE FETCH WRAPPER
// ============================================

async function baseFetch<T>(
  endpoint: string,
  options: FetchOptions & { method: string }
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...axiosOptions } = options;
  const axiosInstance = getClientAxiosInstance();

  const response = await axiosInstance.request<T>({
    url: endpoint,
    ...axiosOptions,
    skipAuth,
    headers: customHeaders
  } as AxiosRequestConfig);

  return response.data;
}

// ============================================
// API CLIENT
// ============================================

export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: FetchOptions) =>
    baseFetch<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      data
    }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      data
    }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    baseFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      data
    }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: FetchOptions) =>
    baseFetch<T>(endpoint, { ...options, method: 'DELETE' })
};

// ============================================
// PAGINATION HELPERS
// ============================================

export function buildPaginationQuery(params: Partial<PaginationParams>): string {
  const searchParams = new URLSearchParams();

  if (params.before) searchParams.set('before', params.before);
  if (params.after) searchParams.set('after', params.after);
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// ============================================
// RESPONSE WRAPPER WITH VALIDATION
// ============================================

export async function fetchWithValidation<T>(
  endpoint: string,
  schema: z.ZodType<T>,
  options?: FetchOptions
): Promise<T> {
  const response = await api.get<ApiResponse<T>>(endpoint, options);

  if (!response.success || !response.data) {
    throw new ApiError(
      400,
      response.message || 'Invalid response',
      undefined,
      'INVALID_RESPONSE'
    );
  }

  const result = schema.safeParse(response.data);
  if (!result.success) {
    console.error('[Validation Error]', result.error.flatten());
    throw new ApiError(
      422,
      'Response data validation failed',
      { zodErrors: result.error.flatten() },
      'VALIDATION_ERROR'
    );
  }

  return result.data;
}

// ============================================
// ERROR HANDLING UTILITIES (Re-export for convenience)
// ============================================

export { ApiError, isApiError, getErrorMessage } from './api-error';

// ============================================
// SAFE FETCH WRAPPER
// ============================================

/**
 * Safe wrapper for async operations with error handling
 */
export async function safeFetch<T>(
  fetcher: () => Promise<T>
): Promise<{ data: T; error: null } | { data: null; error: ApiError }> {
  try {
    const data = await fetcher();
    return { data, error: null };
  } catch (error) {
    if (isApiError(error)) {
      return { data: null, error };
    }

    // Wrap unknown errors
    const apiError = new ApiError(
      500,
      getErrorMessage(error),
      undefined,
      'UNKNOWN_ERROR'
    );
    return { data: null, error: apiError };
  }
}
