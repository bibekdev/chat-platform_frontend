import { keepPreviousData } from '@tanstack/react-query';

import { useInfiniteScroll } from '@/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';
import { FriendRequestWithSender } from '../types';

export const useFriendRequestReceived = () => {
  return useInfiniteScroll<FriendRequestWithSender>({
    queryKey: queryKeys.friends.incomingRequests(),
    queryFn: ({ pageParam }) =>
      api.get<PaginatedResponse<FriendRequestWithSender>>(
        endpoints.friends.getIncomingFriendRequests +
          (pageParam ? `?cursor=${pageParam}` : '')
      ),
    queryOptions: {
      placeholderData: keepPreviousData
    }
  });
};
