import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { UpdateMemberRoleRequest } from '../types';

export const useUpdateMemberRole = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, ...data }: UpdateMemberRoleRequest & { memberId: string }) =>
      api.patch(endpoints.conversations.updateMemberRole(conversationId, memberId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.details(conversationId)
      });
      toast.success('Role updated');
    },
    onError: (error: Error) => toast.error(error.message)
  });
};
