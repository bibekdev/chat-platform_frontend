import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { RegisterDto } from '../schemas/auth.schema';

export const useRegisterMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      const response = await api.post(endpoints.auth.register, data, { skipAuth: true });
      return response;
    },
    onError: error => {
      toast.error('Registration failed', {
        description: error.message
      });
    },
    onSuccess: () => {
      router.push('/login');
      toast.success('Registration successful', {
        description: 'You are now registered and can login to your account'
      });
    }
  });
};
