import { keepPreviousData } from '@tanstack/react-query';

import { useInfiniteScroll } from '@/hooks';
import { api } from '@/lib/api';
import { endpoints } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';
import { GetAllFriendsResponse } from '../types';

export const useAllFriends = () => {
  return useInfiniteScroll({
    queryKey: queryKeys.friends.friends(),
    queryFn: ({ pageParam }) =>
      api.get<PaginatedResponse<GetAllFriendsResponse>>(
        endpoints.friends.getFriends + (pageParam ? `?cursor=${pageParam}` : '')
      ),
    queryOptions: {
      placeholderData: keepPreviousData
    }
  });
};
