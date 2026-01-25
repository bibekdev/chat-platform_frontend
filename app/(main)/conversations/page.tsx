import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { ConversationsPageContent } from '@/features/conversations/components';
import { getConversations } from '@/features/conversations/server';
import { Conversation } from '@/features/conversations/types';
import { getServerQueryClient } from '@/lib/queryClient-server';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

const ConversationsPage = async () => {
  const queryClient = getServerQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: getConversations,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PaginatedResponse<Conversation>) =>
      lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ConversationsPageContent />
    </HydrationBoundary>
  );
};

export default ConversationsPage;
