'use client';

import { useState } from 'react';
import {
  DehydratedState,
  HydrationBoundary,
  QueryClientProvider
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { getQueryClient } from '@/lib/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
}

export const QueryProvider = ({ children, dehydratedState }: QueryProviderProps) => {
  // Create query client once per component instance
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};
