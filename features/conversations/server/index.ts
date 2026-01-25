import { endpoints } from '@/lib/api-endpoints';
import { serverApi } from '@/lib/api-server';
import { PaginatedResponse } from '@/lib/types';
import { Conversation, ConversationWithDetails } from '../types';

const CONVERSATIONS_LIMIT = 20;

export const getConversations = async ({ pageParam }: { pageParam: string | null }) => {
  const params = new URLSearchParams();
  params.set('limit', CONVERSATIONS_LIMIT.toString());
  if (pageParam) {
    params.set('cursor', pageParam);
  }
  const url = `${endpoints.conversations.list}?${params.toString()}`;
  const response = await serverApi.get<PaginatedResponse<Conversation>>(url);
  return response;
};

export const getConversationById = async (conversationId: string) => {
  const response = await serverApi.get<ConversationWithDetails>(
    endpoints.conversations.get(conversationId)
  );
  return response;
};
