import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { CreateConversationDto } from '../types';

export const useCreateConversationMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (value: CreateConversationDto) => {
      const response = await api.post<{ id: string }>(
        endpoints.conversations.create,
        value
      );
      return response;
    },
    onSuccess(data) {
      router.push(`/conversations/${data.id}`);
    },
    onError(error) {
      toast.error(error.message);
    }
  });
};
