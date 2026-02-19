import { InfiniteData, useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/hooks';
import { queryKeys } from '@/lib/queryKeys';
import { CONVERSATION_EVENTS } from '@/lib/socket';
import { PaginatedResponse } from '@/lib/types';
import { MessageWithDetails } from '../types';

export function useDeleteMessage(conversationId: string) {
  const { emit, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const deleteMessage = async ({
    messageId,
    forEveryone
  }: {
    messageId: string;
    forEveryone: boolean;
  }) => {
    if (!isConnected) {
      throw new Error('Socket not connected');
    }

    queryClient.setQueryData<InfiniteData<PaginatedResponse<MessageWithDetails>>>(
      queryKeys.messages.list(conversationId),
      oldData => {
        if (!oldData) return oldData;

        if (forEveryone) {
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(m =>
                m.id === messageId
                  ? {
                      ...m,
                      content: null,
                      attachments: [],
                      isDeleted: true,
                      deletedForEveryone: true,
                      deletedAt: new Date().toISOString()
                    }
                  : m
              )
            }))
          };
        }

        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.filter(m => m.id !== messageId)
          }))
        };
      }
    );

    try {
      await emit(CONVERSATION_EVENTS.DELETE_MESSAGE, {
        conversationId,
        messageId,
        forEveryone
      });
    } catch (error) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(conversationId)
      });
      throw error;
    }
  };

  return { deleteMessage };
}
