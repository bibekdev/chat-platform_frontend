import React from 'react';

import { useSocket } from '@/hooks';
import { CONVERSATION_EVENTS } from '@/lib/socket';

export function useConversationRoom(conversationId: string) {
  const { emit, isConnected } = useSocket();
  const joinedRoomRef = React.useRef<string | null>(null);

  const join = async (convId: string) => {
    if (!isConnected) return;

    if (joinedRoomRef.current === convId) return; // Already in the room

    try {
      await emit(CONVERSATION_EVENTS.JOIN_CONVERSATION, { conversationId: convId });
      joinedRoomRef.current = convId;
    } catch (error) {
      console.error(
        `[useConversationRoom] Failed to join conversation ${convId}:`,
        error
      );
    }
  };

  const leave = async (convId: string) => {
    if (!isConnected) return;

    if (joinedRoomRef.current !== convId) return; // Not in the room

    try {
      await emit(CONVERSATION_EVENTS.LEAVE_CONVERSATION, { conversationId: convId });
      joinedRoomRef.current = null;
    } catch (error) {
      console.error(
        `[useConversationRoom] Failed to leave conversation ${convId}:`,
        error
      );
    }
  };

  React.useEffect(() => {
    if (!conversationId || !isConnected) return;

    join(conversationId);

    return () => {
      if (joinedRoomRef.current) {
        leave(joinedRoomRef.current);
      }
    };
  }, [conversationId, isConnected, join, leave]);
}
