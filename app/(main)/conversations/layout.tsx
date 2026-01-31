import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { ConversationSidebar } from '@/features/conversations/components/sidebar';
import { getConversations } from '@/features/conversations/server';
import { Conversation } from '@/features/conversations/types';
import { getServerQueryClient } from '@/lib/queryClient-server';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

const ConversationLayout = async ({ children }: { children: React.ReactNode }) => {
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
      <div className='flex h-full'>
        <ConversationSidebar />
        {children}
      </div>
    </HydrationBoundary>
  );
};
export default ConversationLayout;
