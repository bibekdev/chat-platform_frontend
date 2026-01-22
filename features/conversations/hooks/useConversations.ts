import { keepPreviousData } from '@tanstack/react-query';

import { useInfiniteScroll } from '@/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';
import { Conversation } from '../types';

const CONVERSATIONS_LIMIT = 20;

export const useConversations = () => {
  return useInfiniteScroll<Conversation>({
    queryKey: queryKeys.conversations.list(),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', CONVERSATIONS_LIMIT.toString());
      if (pageParam) {
        params.set('cursor', pageParam);
      }
      return api.get<PaginatedResponse<Conversation>>(
        `${endpoints.conversations.list}?${params.toString()}`
      );
    },
    queryOptions: {
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60 * 2 // 2 minutes
    }
  });
};
