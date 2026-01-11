'use client';

import { keepPreviousData } from '@tanstack/react-query';

import { useInfiniteScroll } from '@/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';
import { FriendRequestWithReceiver } from '../types';

export const useFriendRequestSent = () => {
  return useInfiniteScroll<FriendRequestWithReceiver>({
    queryKey: queryKeys.friends.outgoingRequests(),
    queryFn: ({ pageParam }) =>
      api.get<PaginatedResponse<FriendRequestWithReceiver>>(
        endpoints.friends.getOutgoingFriendRequests +
          (pageParam ? `?cursor=${pageParam}` : '')
      ),
    queryOptions: {
      placeholderData: keepPreviousData
    }
  });
};
