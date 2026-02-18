import { endpoints } from '@/lib/api-endpoints';
import { serverApi } from '@/lib/api-server';
import { PaginatedResponse } from '@/lib/types';
import { MessageWithDetails } from '../types';

const MESSAGES_LIMIT = 20;

export const getConversationMessages = async ({
  conversationId,
  pageParam
}: {
  pageParam: string | null;
  conversationId: string;
}) => {
  const params = new URLSearchParams();
  params.set('limit', MESSAGES_LIMIT.toString());
  params.set('direction', 'desc');
  if (pageParam) {
    params.set('cursor', pageParam);
  }

  const url = `${endpoints.messages.list(conversationId)}?${params.toString()}`;
  const response = await serverApi.get<PaginatedResponse<MessageWithDetails>>(url);
  return response;
};
