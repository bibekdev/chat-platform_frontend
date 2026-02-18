import React from 'react';

import { socketManager } from '@/lib/socket';

export function useSocketEvents<T extends Record<string, (data: any) => void>>(
  events: T,
  enabled: boolean = true
) {
  const eventsRef = React.useRef(events);
  eventsRef.current = events;

  // Track socket connection status so we re-subscribe when socket connects
  const [isConnected, setIsConnected] = React.useState(socketManager.isConnected());

  React.useEffect(() => {
    return socketManager.onStatusChange(status => {
      setIsConnected(status === 'connected');
    });
  }, []);

  React.useEffect(() => {
    if (!enabled || !isConnected) return;

    const unsubscribes: (() => void)[] = [];

    Object.entries(eventsRef.current).forEach(([event, handler]) => {
      const callback = (data: any) => {
        // Get the latest handler from ref
        const currentHandler = eventsRef.current[event as keyof T];
        if (currentHandler) {
          currentHandler(data);
        }
      };

      const unsubscribe = socketManager.on(event, callback);
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [enabled, isConnected, Object.keys(events).join(',')]);
}
