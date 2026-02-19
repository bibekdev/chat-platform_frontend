import React from 'react';

interface UseScrollAnchorOptions {
  messageCount: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
}

export function useScrollAnchor({
  messageCount,
  isLoading,
  isFetchingNextPage
}: UseScrollAnchorOptions) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isNearBottomRef = React.useRef(true);
  const prevMessageCountRef = React.useRef(0);
  const initialScrollDoneRef = React.useRef(false);
  const wasLoadingMoreRef = React.useRef(false);
  const savedScrollMetricsRef = React.useRef({ scrollHeight: 0, scrollTop: 0 });

  // Continously track whether user is near the bottom (used before DOM updates)
  const handleScroll = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    }
  }, []);

  React.useEffect(() => {
    if (isFetchingNextPage) {
      wasLoadingMoreRef.current = true;
      const el = scrollContainerRef.current;
      if (el) {
        savedScrollMetricsRef.current = {
          scrollHeight: el.scrollHeight,
          scrollTop: el.scrollTop
        };
      }
    }
  }, [isFetchingNextPage]);

  // Handle scroll position after DOM updates (run before browser paints)
  React.useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const currentCount = messageCount;
    const prevCount = prevMessageCountRef.current;

    if (!initialScrollDoneRef.current && currentCount > 0 && !isLoading) {
      // Initial load: scroll to bottom
      el.scrollTop = el.scrollHeight;
      initialScrollDoneRef.current = true;
    } else if (wasLoadingMoreRef.current && !isFetchingNextPage) {
      // Older messages loaded: maintain scroll position so viewport doesn't jump
      wasLoadingMoreRef.current = false;
      const addedHeight = el.scrollHeight - savedScrollMetricsRef.current.scrollHeight;
      el.scrollTop = savedScrollMetricsRef.current.scrollTop + addedHeight;
    } else if (currentCount > prevCount && prevCount > 0) {
      // New message arrived: auto-scroll to bottom if user was near the end
      if (isNearBottomRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messageCount, isLoading, isFetchingNextPage]);

  return { scrollContainerRef, handleScroll };
}
