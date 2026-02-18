import React from 'react';

import { useSocket } from '@/hooks';
import { CONVERSATION_EVENTS } from '@/lib/socket';

export function useConversationRoom(conversationId: string) {
  const { emit, isConnected } = useSocket();
  const joinedRoomRef = React.useRef<string | null>(null);
  const emitRef = React.useRef(emit);
  emitRef.current = emit;

  React.useEffect(() => {
    if (!conversationId || !isConnected) return;

    let cancelled = false;

    const joinRoom = async () => {
      if (joinedRoomRef.current === conversationId) return;

      try {
        await emitRef.current(CONVERSATION_EVENTS.JOIN_CONVERSATION, {
          conversationId
        });
        if (!cancelled) {
          joinedRoomRef.current = conversationId;
        }
      } catch (error) {
        console.error(
          `[useConversationRoom] Failed to join conversation ${conversationId}:`,
          error
        );
      }
    };

    joinRoom();

    return () => {
      cancelled = true;
      const convId = joinedRoomRef.current;
      if (!convId) return;

      joinedRoomRef.current = null;
      emitRef
        .current(CONVERSATION_EVENTS.LEAVE_CONVERSATION, {
          conversationId: convId
        })
        .catch(error => {
          console.error(
            `[useConversationRoom] Failed to leave conversation ${convId}:`,
            error
          );
        });
    };
  }, [conversationId, isConnected]);
}
