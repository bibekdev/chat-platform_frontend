import { InfiniteData, useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/hooks';
import { queryKeys } from '@/lib/queryKeys';
import { CONVERSATION_EVENTS } from '@/lib/socket';
import { PaginatedResponse } from '@/lib/types';
import { MessageWithDetails } from '../types';

export function useEditMessage(conversationId: string) {
  const { emit, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const editMessage = async ({
    messageId,
    content
  }: {
    messageId: string;
    content: string;
  }) => {
    if (!isConnected) {
      throw new Error('Socket not connected');
    }

    queryClient.setQueryData<InfiniteData<PaginatedResponse<MessageWithDetails>>>(
      queryKeys.messages.list(conversationId),
      oldData => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map(m =>
              m.id === messageId
                ? {
                    ...m,
                    content,
                    isEdited: true,
                    editedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                : m
            )
          }))
        };
      }
    );

    try {
      const response = await emit(CONVERSATION_EVENTS.EDIT_MESSAGE, {
        conversationId,
        messageId,
        content
      });
      return response.data;
    } catch (error) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(conversationId)
      });
      throw error;
    }
  };

  return { editMessage };
}
