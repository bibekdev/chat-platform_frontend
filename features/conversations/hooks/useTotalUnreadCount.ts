'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';
import { Conversation } from '../types';

export const useTotalUnreadCount = () => {
  return useQuery({
    queryKey: [...queryKeys.conversations.all, 'totalUnread'],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '50');
      const response = await api.get<PaginatedResponse<Conversation>>(
        `${endpoints.conversations.list}?${params.toString()}`
      );
      return response.data.reduce((sum, conv) => sum + (conv.unreadCount ?? 0), 0);
    },
    staleTime: 1000 * 30
  });
};
