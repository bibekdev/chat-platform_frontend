'use client';

import {
  defaultShouldDehydrateQuery,
  isServer,
  MutationCache,
  QueryCache,
  QueryClient
} from '@tanstack/react-query';

import { ApiError } from './api-error';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.statusCode === 401) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: !isServer,
        refetchOnReconnect: true
      },
      mutations: {
        retry: 1
      }
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`[Query Error] ${query.queryKey}:`, error);
        }
      }
    }),
    mutationCache: new MutationCache({
      onError: error => {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`[Mutation Error]:`, error);
        }
      }
    })
  });
}

/*
 * Client/Server Query Client Management
 */

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: Always create a new query client
    return makeQueryClient();
  }

  // Browser: Create once and reuse
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

// Dehydration config
export const dehydrateOptions = {
  shouldDehydrateQuery: (query: unknown) => {
    // Dehydrate all successful queries
    return defaultShouldDehydrateQuery(query as any);
  }
};
