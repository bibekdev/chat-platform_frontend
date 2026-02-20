import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';

export const useLeaveConversation = (conversationId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post(endpoints.conversations.leave(conversationId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
      router.push('/conversations');
      toast.success('You left the conversation');
    },
    onError: (error: Error) => toast.error(error.message)
  });
};
