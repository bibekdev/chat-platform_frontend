import { useEffect, useRef } from 'react';

import { socketManager } from '@/lib/socket';

export function useSocketEvent<T>(
  event: string,
  handler: (data: T) => void,
  enabled: boolean = true
) {
  // Use ref to always have the latest handler without re-subscribing
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const callback = (data: T) => {
      handlerRef.current(data);
    };

    const unsubscribe = socketManager.on<T>(event, callback);

    return () => {
      unsubscribe();
    };
  }, [event, enabled]);
}
