import { useEffect, useRef } from 'react';

import { socketManager } from '@/lib/socket';

export function useSocketEvents<T extends Record<string, (data: unknown) => void>>(
  events: T,
  enabled: boolean = true
) {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!enabled) return;

    const unsubscribes: (() => void)[] = [];

    Object.entries(eventsRef.current).forEach(([event, handler]) => {
      const callback = (data: unknown) => {
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
  }, [enabled, Object.keys(events).join(',')]);
}
