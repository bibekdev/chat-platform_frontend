import { InfiniteData, useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/hooks';
import { queryKeys } from '@/lib/queryKeys';
import { CONVERSATION_EVENTS } from '@/lib/socket';
import { PaginatedResponse } from '@/lib/types';
import { MessageWithDetails } from '../types';

export function useReactions(conversationId: string) {
  const { emit, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const updateMessageInCache = (updatedMessage: MessageWithDetails) => {
    queryClient.setQueryData<InfiniteData<PaginatedResponse<MessageWithDetails>>>(
      queryKeys.messages.list(conversationId),
      oldData => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map(m => (m.id === updatedMessage.id ? updatedMessage : m))
          }))
        };
      }
    );
  };

  const addReaction = async (messageId: string, reaction: string) => {
    if (!isConnected) {
      throw new Error('Socket not connected');
    }

    try {
      const response = await emit<MessageWithDetails>(CONVERSATION_EVENTS.ADD_REACTION, {
        conversationId,
        messageId,
        reaction
      });
      console.log(response);
      if (response.data) {
        updateMessageInCache(response.data);
      }
    } catch (error) {
      // throw error;
    }
  };

  const removeReaction = async (messageId: string, reaction: string) => {
    if (!isConnected) {
      throw new Error('Socket not connected');
    }

    try {
      const response = await emit<MessageWithDetails>(
        CONVERSATION_EVENTS.REMOVE_REACTION,
        { conversationId, messageId, reaction }
      );
      console.log(response);
      if (response.data) {
        updateMessageInCache(response.data);
      }
    } catch (error) {
      throw error;
    }
  };

  const toggleReaction = async (
    messageId: string,
    reaction: string,
    hasReacted: boolean
  ) => {
    if (hasReacted) {
      await removeReaction(messageId, reaction);
    } else {
      await addReaction(messageId, reaction);
    }
  };

  return { addReaction, removeReaction, toggleReaction };
}
