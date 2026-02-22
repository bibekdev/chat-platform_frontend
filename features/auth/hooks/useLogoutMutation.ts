'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { socketManager } from '@/lib/socket';
import { deleteCookie, getCookie } from '@/lib/utils';

export const useLogoutMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getCookie('chat_refreshToken');
      if (refreshToken) {
        await api.post(endpoints.auth.logout, { refreshToken }, { skipAuth: false });
      }
    },
    onSuccess: () => {
      socketManager.disconnect();
      deleteCookie('chat_accessToken');
      deleteCookie('chat_refreshToken');
      queryClient.clear();
      router.push('/login');
      toast.success('Logged out successfully');
    },
    onError: () => {
      socketManager.disconnect();
      deleteCookie('chat_accessToken');
      deleteCookie('chat_refreshToken');
      queryClient.clear();
      router.push('/login');
    }
  });
};
