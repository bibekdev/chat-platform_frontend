import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { cookies } from 'next/headers';
import type { z } from 'zod';

import { ApiError, ApiErrorResponse, getErrorMessage, isApiError } from './api-error';

// Re-export error utilities for convenience
export { ApiError, getErrorMessage, isApiError } from './api-error';

// ============================================
// TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoggedInAt?: string | null;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  tokens: TokenResponse;
}

interface ServerFetchOptions extends Omit<AxiosRequestConfig, 'url' | 'method'> {
  skipAuth?: boolean;
}

// ============================================
// SERVER-SIDE TOKEN MANAGEMENT
// ============================================

export async function getServerAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('accessToken')?.value || null;
  } catch {
    return null;
  }
}

// ============================================
// API ENDPOINTS
// ============================================

export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me'
  },
  users: {
    profile: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`
  }
} as const;

// ============================================
// QUERY PARAMETER UTILITIES
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function buildPaginationQuery(params: PaginationParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// ============================================
// AXIOS INSTANCE FACTORY
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function createServerAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
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

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log responses in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
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

// Singleton instance for server-side requests
let serverAxiosInstance: AxiosInstance | null = null;

function getServerAxiosInstance(): AxiosInstance {
  if (!serverAxiosInstance) {
    serverAxiosInstance = createServerAxiosInstance();
  }
  return serverAxiosInstance;
}

// ============================================
// SERVER-SIDE FETCH WITH AUTH
// ============================================

async function serverFetch<T>(
  endpoint: string,
  options: ServerFetchOptions & { method: string }
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...axiosOptions } = options;
  const axiosInstance = getServerAxiosInstance();

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>)
  };

  // Add auth token if needed
  if (!skipAuth) {
    const token = await getServerAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await axiosInstance.request<T>({
    url: endpoint,
    ...axiosOptions,
    headers
  });

  return response.data;
}

// ============================================
// SERVER API CLIENT
// ============================================

export const serverApi = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, options?: ServerFetchOptions) =>
    serverFetch<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, data?: unknown, options?: ServerFetchOptions) =>
    serverFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      data
    }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, data?: unknown, options?: ServerFetchOptions) =>
    serverFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      data
    }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, data?: unknown, options?: ServerFetchOptions) =>
    serverFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      data
    }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, options?: ServerFetchOptions) =>
    serverFetch<T>(endpoint, { ...options, method: 'DELETE' })
};

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Fetch data from the server and validate with Zod schema
 */
export async function fetchWithValidationServer<T>(
  endpoint: string,
  schema: z.ZodType<T>,
  options?: ServerFetchOptions
): Promise<T> {
  const response = await serverApi.get<T>(endpoint, options);

  const result = schema.safeParse(response);
  if (!result.success) {
    console.error('[Validation Error]', result.error.flatten());
    throw new ApiError(
      422,
      'Response validation failed',
      { zodErrors: result.error.flatten() },
      'VALIDATION_ERROR'
    );
  }

  return result.data;
}

/**
 * Fetch data wrapped in ApiResponse format and validate
 */
export async function fetchApiResponseWithValidation<T>(
  endpoint: string,
  schema: z.ZodType<T>,
  options?: ServerFetchOptions
): Promise<T> {
  const response = await serverApi.get<ApiResponse<T>>(endpoint, options);

  if (!response.success || !response.data) {
    throw new ApiError(
      400,
      response.message || 'Invalid API response',
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
// ERROR HANDLING UTILITIES
// ============================================

/**
 * Safe wrapper for async operations with error handling
 */
export async function safeServerFetch<T>(
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
