import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000,
        retry: false, // Don't retry on server
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      },
      mutations: {
        retry: false
      }
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (process.env.NODE_ENV === 'development') {
          console.error(`[Query Error] ${query.queryKey}:`, error);
        }
      }
    }),
    mutationCache: new MutationCache({
      onError: error => {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Mutation Error]:', error);
        }
      }
    })
  });
}

export function getServerQueryClient(): QueryClient {
  // Server: Always create a new query client
  return makeQueryClient();
}
