import React from 'react';

import { useSocket, useSocketEvent } from '@/hooks';
import { CONVERSATION_EVENTS, TypingEvent, TypingUser } from '@/lib/socket';

const TYPING_EMIT_INTERVAL_MS = 2000; // Re-emit typing start every 2s to keep receiver fresh
const TYPING_TIMEOUT_MS = 3000; // Auto-stop after 3s of no keystrokes
const TYPING_CLEANUP_MS = 5000; // Remove stale typing indicators after 5s

export function useTypingIndicator(conversationId: string) {
  const { emitNoAck, isConnected } = useSocket();
  const [typingUsers, setTypingUsers] = React.useState<TypingUser[]>([]);
  const isTypingRef = React.useRef(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null);
  const lastEmitRef = React.useRef(0);
  const emitNoAckRef = React.useRef(emitNoAck);
  const enabled = !!conversationId && isConnected;

  emitNoAckRef.current = emitNoAck;

  const stopTyping = React.useCallback(() => {
    if (!conversationId) return;

    if (isTypingRef.current) {
      isTypingRef.current = false;
      lastEmitRef.current = 0;
      emitNoAckRef.current(CONVERSATION_EVENTS.TYPING_STOP, { conversationId });
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [conversationId]);

  const startTyping = React.useCallback(() => {
    if (!enabled || !conversationId) return;

    const now = Date.now();

    if (!isTypingRef.current || now - lastEmitRef.current >= TYPING_EMIT_INTERVAL_MS) {
      isTypingRef.current = true;
      lastEmitRef.current = now;
      emitNoAckRef.current(CONVERSATION_EVENTS.TYPING_START, { conversationId });
    }

    // Reset the auto-stop timeout on every keystroke
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(stopTyping, TYPING_TIMEOUT_MS);
  }, [enabled, conversationId, stopTyping]);

  useSocketEvent<TypingEvent>(
    CONVERSATION_EVENTS.USER_TYPING,
    event => {
      if (event.conversationId !== conversationId) return;

      setTypingUsers(prev => {
        if (event.isTyping) {
          // Add or update typing user
          const existing = prev.find(t => t.user.id === event.user.id);
          if (existing) {
            return prev.map(t =>
              t.user.id === event.user.id ? { ...t, timestamp: Date.now() } : t
            );
          }
          return [...prev, { user: event.user, timestamp: Date.now() }];
        } else {
          return prev.filter(t => t.user.id !== event.user.id);
        }
      });
    },
    enabled
  );

  //  ------------- Cleanup stale typing indicators -------------
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const filtered = prev.filter(t => now - t.timestamp < TYPING_CLEANUP_MS);
        return filtered.length === prev.length ? prev : filtered;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  //  ------------- Stop typing on unmount or conversation change -------------
  React.useEffect(() => {
    return () => {
      if (isTypingRef.current) {
        stopTyping();
      }
      setTypingUsers([]);
    };
  }, [conversationId, stopTyping]);

  return {
    typingUsers: typingUsers.map(t => t.user),
    startTyping,
    stopTyping
  };
}
