import { useRouter, useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { setCookie } from '@/lib/utils';
import { LoginDto } from '../schemas/auth.schema';
import { LoginResponse } from '../types';

export const useLoginMutation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await api.post<LoginResponse>(endpoints.auth.login, data, {
        skipAuth: true
      });
      return response;
    },
    onError: error => {
      toast.error('Login failed', {
        description: error.message
      });
    },
    onSuccess: data => {
      const { tokens } = data;

      setCookie('chat_accessToken', tokens.accessToken, {
        expires: new Date(Date.now() + tokens.expiresIn * 1000)
      });
      setCookie('chat_refreshToken', tokens.refreshToken);
      router.push(callbackUrl ?? '/');
      toast.success('Login successful', {
        description: 'You are now logged in'
      });
    }
  });
};
