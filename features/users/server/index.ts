import { endpoints } from '@/lib/api-endpoints';
import { serverApi } from '@/lib/api-server';
import { PaginatedResponse } from '@/lib/types';
import { UserSuggestion } from '../types';

export const getUserSuggestions = async ({
  pageParam
}: {
  pageParam: string | null;
}) => {
  const url = pageParam
    ? `${endpoints.users.suggestions}?cursor=${pageParam}`
    : endpoints.users.suggestions;
  const response = await serverApi.get<PaginatedResponse<UserSuggestion>>(url);
  return response;
};
