import { cookies } from 'next/headers';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

import { ApiError, ApiErrorResponse } from './api-error';

// ============================================
// TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
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
    return cookieStore.get('chat_accessToken')?.value || null;
  } catch {
    return null;
  }
}

const API_URL = process.env.API_URL || 'http://localhost:8080/api/v1';

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

      // Note: Server-side token refresh is disabled because cookies().set() only works
      // in Server Actions or Route Handlers, NOT in Server Components or interceptors.
      // If we refresh tokens here, we can't persist the new cookies, which causes
      // "Token has been revoked" errors on subsequent requests.
      // Let the client-side handle all token refresh via api.ts interceptor.

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
