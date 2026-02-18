import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { ConversationIdPageContent } from '@/features/conversations/components';
import { getConversationById } from '@/features/conversations/server';
import { getConversationMessages } from '@/features/messages/server';
import { MessageWithDetails } from '@/features/messages/types';
import { getServerQueryClient } from '@/lib/queryClient-server';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';

interface ConversationIdPageProps {
  params: Promise<{ conversationId: string }>;
}

const ConversationIdPage = async ({ params }: ConversationIdPageProps) => {
  const { conversationId } = await params;
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.conversations.details(conversationId),
    queryFn: () => getConversationById(conversationId)
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.messages.list(conversationId),
    queryFn: ({ pageParam }) => getConversationMessages({ conversationId, pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PaginatedResponse<MessageWithDetails>) =>
      lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <ConversationIdPageContent conversationId={conversationId} />
    </HydrationBoundary>
  );
};

export default ConversationIdPage;
