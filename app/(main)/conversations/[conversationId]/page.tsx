import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getConversationById } from '@/features/conversations/server';
import { MessagePageContent } from '@/features/messages/components';
import { getServerQueryClient } from '@/lib/queryClient-server';
import { queryKeys } from '@/lib/queryKeys';

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

  const dehydratedState = dehydrate(queryClient);

  const data = queryClient.getQueryData(queryKeys.conversations.details(conversationId));

  console.log(data);

  return (
    <HydrationBoundary state={dehydratedState}>
      <MessagePageContent />
    </HydrationBoundary>
  );
};

export default ConversationIdPage;
