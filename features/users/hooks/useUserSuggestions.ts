'use client';

import { keepPreviousData } from '@tanstack/react-query';

import { useInfiniteScroll } from '@/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';
import { UserSuggestion } from '../types';

export const useUserSuggestions = () => {
  return useInfiniteScroll<UserSuggestion>({
    queryKey: queryKeys.user.suggestions(),
    queryFn: ({ pageParam }) =>
      api.get<PaginatedResponse<UserSuggestion>>(
        endpoints.users.suggestions + (pageParam ? `?cursor=${pageParam}` : '')
      ),
    queryOptions: {
      placeholderData: keepPreviousData
    }
  });
};
