'use client';

import React from 'react';

import { useAuthUser } from '@/features/auth/hooks';
import {
  MessageHeader,
  MessageList,
  MessageInput,
  TypingIndicator
} from '@/features/messages/components';
import {
  useEditMessage,
  useSendMessage,
  useTypingIndicator
} from '@/features/messages/hooks';
import { MessageWithDetails } from '@/features/messages/types';
import { useConversationRoom, useConversationSocket } from '../hooks';

interface ConversationIdPageContentProps {
  conversationId: string;
}

export const ConversationIdPageContent = ({
  conversationId
}: ConversationIdPageContentProps) => {
  const [editingMessage, setEditingMessage] = React.useState<{
    id: string;
    content: string;
  } | null>(null);
  const { data: user } = useAuthUser();

  useConversationRoom(conversationId);
  useConversationSocket(conversationId);

  const { sendMessageOptimistic } = useSendMessage(conversationId);
  const { editMessage } = useEditMessage(conversationId);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(conversationId);

  const handleSendMessage = async (content: string) => {
    if (!user) return;
    stopTyping();
    await sendMessageOptimistic(
      { content, type: 'text' },
      { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
    );
  };

  const handleStartEdit = (message: MessageWithDetails) => {
    if (message.content) {
      setEditingMessage({ id: message.id, content: message.content });
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleEditMessage = async (content: string) => {
    if (!editingMessage) return;
    await editMessage({ messageId: editingMessage.id, content });
    setEditingMessage(null);
  };

  return (
    <div className='flex-1 flex flex-col h-full'>
      <MessageHeader conversationId={conversationId} />
      <MessageList
        onStartEdit={handleStartEdit}
        conversationId={conversationId}
      />
      <TypingIndicator users={typingUsers} />
      <div className='border-t p-4'>
        <MessageInput
          startTyping={startTyping}
          onSendMessage={handleSendMessage}
          editingMessage={editingMessage}
          onEditMessage={handleEditMessage}
          onCancelEdit={handleCancelEdit}
        />
      </div>
    </div>
  );
};
