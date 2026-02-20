import { useRouter } from 'next/navigation';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';

export const useDeleteConversation = (conversationId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete(endpoints.conversations.delete(conversationId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
      router.push('/conversations');
      toast.success('Conversation deleted');
    },
    onError: (error: Error) => toast.error(error.message)
  });
};
