import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';

export const useFriendRequestIncomingCount = () => {
  return useQuery({
    queryKey: queryKeys.friends.incomingRequestsCount(),
    queryFn: async () => {
      const response = await api.get<{ count: number }>(
        endpoints.friends.getIncomingRequestsCount
      );
      return response.count;
    }
  });
};
