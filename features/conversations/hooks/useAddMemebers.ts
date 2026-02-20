import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { AddMembersRequest, ConversationMember } from '../types';

export const useAddMembers = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMembersRequest) =>
      api.post<ConversationMember[]>(
        endpoints.conversations.addMembers(conversationId),
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.details(conversationId)
      });
      toast.success('Members added');
    },
    onError: (error: Error) => toast.error(error.message)
  });
};
