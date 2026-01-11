'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';

interface SendFriendRequestDto {
  receiverId: string;
}

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendFriendRequestDto) => {
      const response = await api.post(endpoints.friends.sendFriendRequest, data);
      return response;
    },
    onError: error => {
      toast.error('Failed to send friend request', {
        description: error.message
      });
    },
    onSuccess: async () => {
      // Invalidate queries so they refetch when they become active (e.g., switching tabs)
      queryClient.invalidateQueries({ queryKey: queryKeys.user.suggestions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.outgoingRequests() });

      // Also immediately refetch active queries (ones with mounted components)
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: queryKeys.user.suggestions(),
          type: 'active'
        }),
        queryClient.refetchQueries({
          queryKey: queryKeys.friends.outgoingRequests(),
          type: 'active'
        })
      ]);
      toast.success('Friend request sent');
    }
  });
};
