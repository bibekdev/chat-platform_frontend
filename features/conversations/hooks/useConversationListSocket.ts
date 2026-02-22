import { useQueryClient } from '@tanstack/react-query';

import { useSocketEvents } from '@/hooks';
import { queryKeys } from '@/lib/queryKeys';
import { CONVERSATION_EVENTS, MessageReadEvent } from '@/lib/socket';

export function useConversationListSocket() {
  const queryClient = useQueryClient();

  const handleNewMessage = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.conversations.all, 'totalUnread']
    });
  };

  const handleMessageRead = (event: MessageReadEvent) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() });
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.conversations.all, 'totalUnread']
    });
  };

  useSocketEvents({
    [CONVERSATION_EVENTS.NEW_MESSAGE]: handleNewMessage,
    [CONVERSATION_EVENTS.MESSAGE_READ]: handleMessageRead
  });
}
