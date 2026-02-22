'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useSocketEvent, useSocketEvents } from '@/hooks';
import {
  OnlineFriendsEvent,
  SOCKET_EVENTS,
  UserOfflineEvent,
  UserOnlineEvent
} from '@/lib/socket';

interface OnlinePresenceContextValue {
  onlineUserIds: Set<string>;
  isUserOnline: (userId: string) => boolean;
}

const OnlinePresenceContext = createContext<OnlinePresenceContextValue>({
  onlineUserIds: new Set(),
  isUserOnline: () => false
});

export function OnlinePresenceProvider({ children }: { children: React.ReactNode }) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const handleOnlineFriends = useCallback((event: OnlineFriendsEvent) => {
    setOnlineUserIds(new Set(event.userIds));
  }, []);

  const handleUserOnline = useCallback((event: UserOnlineEvent) => {
    setOnlineUserIds(prev => {
      const next = new Set(prev);
      next.add(event.userId);
      return next;
    });
  }, []);

  const handleUserOffline = useCallback((event: UserOfflineEvent) => {
    setOnlineUserIds(prev => {
      const next = new Set(prev);
      next.delete(event.userId);
      return next;
    });
  }, []);

  useSocketEvents({
    [SOCKET_EVENTS.ONLINE_FRIENDS]: handleOnlineFriends,
    [SOCKET_EVENTS.USER_ONLINE]: handleUserOnline,
    [SOCKET_EVENTS.USER_OFFLINE]: handleUserOffline
  });

  const isUserOnline = useCallback(
    (userId: string) => onlineUserIds.has(userId),
    [onlineUserIds]
  );

  const value = useMemo(
    () => ({ onlineUserIds, isUserOnline }),
    [onlineUserIds, isUserOnline]
  );

  return (
    <OnlinePresenceContext.Provider value={value}>
      {children}
    </OnlinePresenceContext.Provider>
  );
}

export function useOnlinePresenceContext() {
  return useContext(OnlinePresenceContext);
}
