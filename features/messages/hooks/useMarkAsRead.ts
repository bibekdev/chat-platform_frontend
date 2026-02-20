'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSocket } from '@/hooks';
import { queryKeys } from '@/lib/queryKeys';
import { CONVERSATION_EVENTS } from '@/lib/socket';

export function useMarkAsRead(conversationId: string) {
  const { emit, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const lastMarkedRef = React.useRef<string | null>(null);

  const markAsRead = async (messageId: string) => {
    if (!isConnected || !messageId) return;

    if (lastMarkedRef.current === messageId) return;

    lastMarkedRef.current = messageId;

    try {
      await emit(CONVERSATION_EVENTS.MARK_READ, { conversationId, messageId });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
    } catch (error) {
      lastMarkedRef.current = null;
      console.error(`[useMarkAsRead] Failed:`, error);
    }
  };

  return { markAsRead };
}
