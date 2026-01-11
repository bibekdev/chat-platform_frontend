import { endpoints } from '@/lib/api-endpoints';
import { serverApi } from '@/lib/api-server';
import { PaginatedResponse } from '@/lib/types';
import { Friend, FriendRequestWithReceiver, FriendRequestWithSender } from '../types';

export const getIncomingFriendRequestsCount = async () => {
  const response = await serverApi.get<{ count: number }>(
    endpoints.friends.getIncomingRequestsCount
  );
  return response.count;
};

export const getFriends = async ({ pageParam }: { pageParam: string | null }) => {
  const url = pageParam
    ? `${endpoints.friends.getFriends}?cursor=${pageParam}`
    : endpoints.friends.getFriends;
  const response = await serverApi.get<PaginatedResponse<Friend>>(url);
  return response;
};

export const getIncomingFriendRequests = async ({
  pageParam
}: {
  pageParam: string | null;
}) => {
  const url = pageParam
    ? `${endpoints.friends.getIncomingFriendRequests}?cursor=${pageParam}`
    : endpoints.friends.getIncomingFriendRequests;
  const response = await serverApi.get<PaginatedResponse<FriendRequestWithSender>>(url);
  return response;
};

export const getOutgoingFriendRequests = async ({
  pageParam
}: {
  pageParam: string | null;
}) => {
  const url = pageParam
    ? `${endpoints.friends.getOutgoingFriendRequests}?cursor=${pageParam}`
    : endpoints.friends.getOutgoingFriendRequests;
  const response = await serverApi.get<PaginatedResponse<FriendRequestWithReceiver>>(url);
  return response;
};
