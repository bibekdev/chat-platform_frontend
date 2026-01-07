import { endpoints } from '@/lib/api-endpoints';
import { serverApi } from '@/lib/api-server';
import { AuthUser } from '../types';

export const getUser = async () => {
  try {
    const response = await serverApi.get<AuthUser>(endpoints.auth.me);
    return response;
  } catch (error) {
    return null;
  }
};
