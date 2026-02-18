import { keepPreviousData } from '@tanstack/react-query';

import { useInfiniteScroll } from '@/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';
import { MessageWithDetails } from '../types';

const MESSAGE_LIMIT = 20;

export function useGetMessages(conversationId: string) {
  return useInfiniteScroll<MessageWithDetails>({
    queryKey: queryKeys.messages.list(conversationId),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', MESSAGE_LIMIT.toString());
      params.set('direction', 'desc');
      if (pageParam) {
        params.set('cursor', pageParam);
      }

      return api.get<PaginatedResponse<MessageWithDetails>>(
        `${endpoints.messages.list(conversationId)}?${params.toString()}`
      );
    },
    queryOptions: {
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60 * 2 // 2 minutes
    }
  });
}
