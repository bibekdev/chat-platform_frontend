'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';

import { User } from '../types';

export const useAuthUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const response = await api.get<User>(endpoints.auth.me);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false
  });
};
