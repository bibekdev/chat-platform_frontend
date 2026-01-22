import { useEffect, useState } from 'react';

import { socketManager, SocketStatus } from '@/lib/socket';

export function useSocketStatus() {
  const [status, setStatus] = useState<SocketStatus>('disconnected');

  useEffect(() => {
    const unsubscribe = socketManager.onStatusChange(setStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isDisconnected: status === 'disconnected',
    isError: status === 'error'
  };
}
