'use client';

import { useCallback, useEffect, useRef } from 'react';

import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from '@tanstack/react-query';

import { PaginatedResponse } from '@/lib/types';

// ============================================
// TYPES
// ============================================

export interface UseInfiniteScrollOptions<TData, TError = Error> {
  /** React Query key for caching */
  queryKey: QueryKey;
  /** Function to fetch paginated data */
  queryFn: (params: { pageParam: string | null }) => Promise<PaginatedResponse<TData>>;
  /** Intersection Observer root margin (e.g., "100px" to trigger before reaching the end) */
  rootMargin?: string;
  /** Intersection Observer threshold */
  threshold?: number;
  /** Whether the query is enabled */
  enabled?: boolean;
  /** Additional React Query options */
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<TData>,
      TError,
      InfiniteData<PaginatedResponse<TData>>,
      QueryKey,
      string | null
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >;
}

export interface UseInfiniteScrollReturn<TData> {
  /** Flattened array of all loaded items */
  data: TData[];
  /** Whether the initial load is in progress */
  isLoading: boolean;
  /** Whether fetching the next page */
  isFetchingNextPage: boolean;
  /** Whether there are more pages to load */
  hasNextPage: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Ref to attach to the sentinel element for auto-loading */
  loadMoreRef: (node: HTMLElement | null) => void;
  /** Manually fetch next page */
  fetchNextPage: () => void;
  /** Refetch all pages */
  refetch: () => void;
  /** Whether any fetching is happening */
  isFetching: boolean;
}

// ============================================
// HOOK
// ============================================

export function useInfiniteScroll<TData, TError = Error>({
  queryKey,
  queryFn,
  rootMargin = '200px',
  threshold = 0,
  enabled = true,
  queryOptions
}: UseInfiniteScrollOptions<TData, TError>): UseInfiniteScrollReturn<TData> {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLElement | null>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    refetch,
    isFetching
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: lastPage => {
      if (lastPage.pagination.hasMore && lastPage.pagination.nextCursor) {
        return lastPage.pagination.nextCursor;
      }
      return undefined;
    },
    enabled,
    ...queryOptions
  });

  // Flatten all paıges into a single array
  const flatData = data?.pages.flatMap(page => page.data) ?? [];

  // Set up intersection observer for auto-loading
  const loadMoreRef = useCallback(
    (node: HTMLElement | null) => {
      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      sentinelRef.current = node;

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        entries => {
          const [entry] = entries;
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          rootMargin,
          threshold
        }
      );

      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin, threshold]
  );

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    data: flatData,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    error: error as Error | null,
    loadMoreRef,
    fetchNextPage,
    refetch,
    isFetching
  };
}
