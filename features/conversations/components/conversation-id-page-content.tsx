'use client';

import { useAuthUser } from '@/features/auth/hooks';
import { MessageHeader, MessageList, MessageInput } from '@/features/messages/components';
import { useSendMessage } from '@/features/messages/hooks';
import { useConversationRoom, useConversationSocket } from '../hooks';

interface ConversationIdPageContentProps {
  conversationId: string;
}

export const ConversationIdPageContent = ({
  conversationId
}: ConversationIdPageContentProps) => {
  const { data: user } = useAuthUser();

  useConversationRoom(conversationId);
  useConversationSocket(conversationId);

  const { sendMessageOptimistic } = useSendMessage(conversationId);

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    await sendMessageOptimistic(
      { content, type: 'text' },
      { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
    );
  };

  return (
    <div className='flex-1 flex flex-col h-full'>
      <MessageHeader conversationId={conversationId} />
      <MessageList conversationId={conversationId} />
      <div className='border-t p-4'>
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};
