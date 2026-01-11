import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      await api.post(endpoints.friends.acceptFriendRequest(requestId));
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.friends() });
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.incomingRequests() });

      await Promise.all([
        queryClient.refetchQueries({
          queryKey: queryKeys.friends.friends(),
          type: 'active'
        }),
        queryClient.refetchQueries({
          queryKey: queryKeys.friends.incomingRequests(),
          type: 'active'
        })
      ]);
      toast.success('Friend request accepted');
    },
    onError: error => {
      toast.error('Failed to accept friend request', {
        description: error.message
      });
    }
  });
};
