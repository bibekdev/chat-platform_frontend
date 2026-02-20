import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { UpdateConversationRequest } from '../types';

export const useUpdateConversation = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateConversationRequest) =>
      api.put(endpoints.conversations.update(conversationId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.details(conversationId)
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
      toast.success('Conversation updated');
    },
    onError: (error: Error) => toast.error(error.message)
  });
};
