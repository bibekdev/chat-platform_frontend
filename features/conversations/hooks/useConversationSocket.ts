import { InfiniteData, useQueryClient } from '@tanstack/react-query';

import { MessageWithDetails } from '@/features/messages/types';
import { useSocketEvents } from '@/hooks';
import { queryKeys } from '@/lib/queryKeys';
import {
  CONVERSATION_EVENTS,
  MessageDeletedEvent,
  MessageReadEvent,
  MessageUpdatedEvent,
  NewMessageEvent
} from '@/lib/socket';
import { PaginatedResponse } from '@/lib/types';

export const useConversationSocket = (conversationId: string) => {
  const queryClient = useQueryClient();
  const enabled = !!conversationId;

  const handleNewMessage = (event: NewMessageEvent) => {
    if (event.conversationId !== conversationId) return;

    // Prepend new message to the messages list cache
    queryClient.setQueryData<InfiniteData<PaginatedResponse<MessageWithDetails>>>(
      queryKeys.messages.list(conversationId),
      oldData => {
        if (!oldData) return oldData;

        const firstPage = oldData.pages[0];
        if (!firstPage) return oldData;

        // Check for duplicate (optimistic update may already have this message)
        const exists = firstPage.data.some(m => m.id === event.message.id);
        if (exists) {
          // Replace optimistic version with server version
          return {
            ...oldData,
            pages: oldData.pages.map((page, i) =>
              i === 0
                ? {
                    ...page,
                    data: page.data.map(m =>
                      m.id === event.message.id ? event.message : m
                    )
                  }
                : page
            )
          };
        }

        return {
          ...oldData,
          pages: [
            { ...firstPage, data: [event.message, ...firstPage.data] },
            ...oldData.pages.slice(1)
          ]
        };
      }
    );
    // Also update conversation list (last message, reorder)
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
  };

  const handleMessageUpdated = (event: MessageUpdatedEvent) => {
    if (event.conversationId !== conversationId) return;

    queryClient.setQueryData<InfiniteData<PaginatedResponse<MessageWithDetails>>>(
      queryKeys.messages.list(event.conversationId),
      oldData => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map(m => (m.id === event.message.id ? event.message : m))
          }))
        };
      }
    );
  };

  const handleMessageDeleted = (event: MessageDeletedEvent) => {
    if (event.conversationId !== conversationId) return;

    if (event.deletedForEveryone) {
      queryClient.setQueryData<InfiniteData<PaginatedResponse<MessageWithDetails>>>(
        queryKeys.messages.list(event.conversationId),
        oldData => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(m =>
                m.id === event.messageId
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
      );
    }
  };

  const handleMessageRead = (event: MessageReadEvent) => {
    if (event.conversationId !== conversationId) return;

    queryClient.invalidateQueries({
      queryKey: queryKeys.conversations.details(conversationId)
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
  };

  useSocketEvents(
    {
      [CONVERSATION_EVENTS.NEW_MESSAGE]: handleNewMessage,
      [CONVERSATION_EVENTS.MESSAGE_UPDATED]: handleMessageUpdated,
      [CONVERSATION_EVENTS.MESSAGE_DELETED]: handleMessageDeleted,
      [CONVERSATION_EVENTS.MESSAGE_READ]: handleMessageRead
    },
    enabled
  );
};
