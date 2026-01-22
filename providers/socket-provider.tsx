'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAuthUser } from '@/features/auth/hooks';
import {
  createSocketContextValue,
  SocketContext,
  socketManager,
  SocketStatus
} from '@/lib/socket';

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const [isConnected, setIsConnected] = useState(false);

  // Get auth user to determine if we should connect
  const { data: user, isLoading: isAuthLoading } = useAuthUser();

  // Handle status changes
  useEffect(() => {
    const unsubscribe = socketManager.onStatusChange(newStatus => {
      setStatus(newStatus);
      setIsConnected(newStatus === 'connected');
    });

    return () => unsubscribe();
  }, []);

  // Handle error logging
  useEffect(() => {
    const unsubscribe = socketManager.onError(error => {
      console.error('[SocketProvider] Socket error:', error.message);
    });

    return () => unsubscribe();
  }, []);

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      // User is authenticated, connect to socket
      socketManager.connect();
    } else {
      // User is not authenticated, disconnect from socket
      socketManager.disconnect();
    }
  }, [user, isAuthLoading]);

  // Create context value
  const contextValue = useMemo(
    () => createSocketContextValue(isConnected, status),
    [isConnected, status]
  );

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
}
