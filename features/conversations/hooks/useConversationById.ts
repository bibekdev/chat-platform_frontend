import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { ConversationWithDetails } from '../types';

export const useConversationById = (conversationId: string) => {
  return useQuery({
    queryKey: queryKeys.conversations.details(conversationId),
    queryFn: async () => {
      const response = await api.get<ConversationWithDetails>(
        endpoints.conversations.details(conversationId)
      );
      return response;
    }
  });
};
