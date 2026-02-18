import { useQueryClient } from '@tanstack/react-query';

import { useSocketEvents } from '@/hooks';
import { queryKeys } from '@/lib/queryKeys';
import { CONVERSATION_EVENTS } from '@/lib/socket';

export function useConversationListSocket() {
  const queryClient = useQueryClient();

  const handleNewMessage = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
  };

  useSocketEvents({
    [CONVERSATION_EVENTS.NEW_MESSAGE]: handleNewMessage
  });
}
