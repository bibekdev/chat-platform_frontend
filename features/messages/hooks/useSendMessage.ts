'use client';

import { InfiniteData, useQueryClient } from '@tanstack/react-query';

import { PublicUser } from '@/features/conversations/types';
import { useSocket } from '@/hooks';
import { queryKeys } from '@/lib/queryKeys';
import { CONVERSATION_EVENTS } from '@/lib/socket';
import { PaginatedResponse } from '@/lib/types';
import { CreateMessageDto, MessageWithDetails, MessageWithSender } from '../types';

export function useSendMessage(conversationId: string) {
  const { emit, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const sendMessage = async (data: CreateMessageDto) => {
    if (!isConnected) {
      throw new Error('Socket is not connected');
    }

    try {
      const response = await emit<MessageWithDetails>(CONVERSATION_EVENTS.SEND_MESSAGE, {
        conversationId,
        content: data.content,
        type: data.type ?? 'text',
        replyToId: data.replyToId,
        attachments: data.attachments
      });

      return response.data;
    } catch (error) {
      console.error('[useSendMessage] Error sending message:', error);
      throw error;
    }
  };

  const sendMessageOptimistic = async (
    data: CreateMessageDto,
    currentUser: PublicUser,
    replyToMessage?: MessageWithDetails
  ) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const replyTo: MessageWithSender | undefined = replyToMessage
      ? {
          id: replyToMessage.id,
          conversationId: replyToMessage.conversationId,
          senderId: replyToMessage.senderId,
          content: replyToMessage.content,
          type: replyToMessage.type,
          replyToId: replyToMessage.replyToId,
          forwardedFromId: replyToMessage.forwardedFromId,
          isEdited: replyToMessage.isEdited,
          editedAt: replyToMessage.editedAt,
          isDeleted: replyToMessage.isDeleted,
          deletedAt: replyToMessage.deletedAt,
          deletedForEveryone: replyToMessage.deletedForEveryone,
          createdAt: replyToMessage.createdAt,
          updatedAt: replyToMessage.updatedAt,
          metadata: replyToMessage.metadata,
          sender: replyToMessage.sender
        }
      : undefined;

    const optimisticMessage: MessageWithDetails = {
      id: tempId,
      content: data.content ?? null,
      type: data.type ?? 'text',
      replyToId: data.replyToId ?? null,
      replyTo: replyTo ?? undefined,
      attachments: data.attachments ?? undefined,
      sender: currentUser,
      conversationId,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      forwardedFromId: null,
      isEdited: false,
      editedAt: null,
      isDeleted: false,
      deletedAt: null,
      metadata: null,
      deletedForEveryone: false
    };

    queryClient.setQueryData<InfiniteData<PaginatedResponse<MessageWithDetails>>>(
      queryKeys.messages.list(conversationId),
      oldData => {
        if (!oldData) return oldData;

        const firstPage = oldData.pages[0];
        if (!firstPage) return oldData;

        return {
          ...oldData,
          pages: [
            {
              ...firstPage,
              data: [optimisticMessage, ...firstPage.data]
            },
            ...oldData.pages.slice(1)
          ]
        };
      }
    );

    try {
      const serverMessage = await sendMessage(data);

      queryClient.setQueryData<InfiniteData<PaginatedResponse<MessageWithDetails>>>(
        queryKeys.messages.list(conversationId),
        oldData => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(m => (m.id === tempId ? (serverMessage ?? m) : m))
            }))
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list()
      });

      return serverMessage;
    } catch (error) {
      queryClient.setQueryData<InfiniteData<PaginatedResponse<MessageWithDetails>>>(
        queryKeys.messages.list(conversationId),
        oldData => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.filter(m => m.id !== tempId)
            }))
          };
        }
      );

      throw error;
    }
  };

  return { sendMessageOptimistic };
}
