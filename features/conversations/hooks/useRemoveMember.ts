import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';

export const useRemoveMember = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      api.delete(endpoints.conversations.removeMember(conversationId, memberId)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.details(conversationId)
      });
      toast.success('Member removed');
    },
    onError: (error: Error) => toast.error(error.message)
  });
};
