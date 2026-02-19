'use client';

import {
  MessageHeader,
  MessageList,
  MessageInput,
  TypingIndicator
} from '@/features/messages/components';
import { useMessageActions } from '@/features/messages/hooks';
import { useConversationRoom, useConversationSocket } from '../hooks';

interface ConversationIdPageContentProps {
  conversationId: string;
}

export const ConversationIdPageContent = ({
  conversationId
}: ConversationIdPageContentProps) => {
  useConversationRoom(conversationId);
  useConversationSocket(conversationId);

  const {
    editingMessage,
    replyingToMessage,
    typingUsers,
    startTyping,
    handleSendMessage,
    handleStartReply,
    handleCancelReply,
    handleStartEdit,
    handleCancelEdit,
    handleEditMessage,
    handleDeleteMessage
  } = useMessageActions(conversationId);

  return (
    <div className='flex-1 flex flex-col h-full'>
      <MessageHeader conversationId={conversationId} />
      <MessageList
        onStartEdit={handleStartEdit}
        conversationId={conversationId}
        onDeleteMessage={handleDeleteMessage}
        onStartReply={handleStartReply}
      />
      <TypingIndicator users={typingUsers} />
      <div className='border-t p-4'>
        <MessageInput
          startTyping={startTyping}
          onSendMessage={handleSendMessage}
          editingMessage={editingMessage}
          onEditMessage={handleEditMessage}
          onCancelEdit={handleCancelEdit}
          replyingToMessage={replyingToMessage}
          onCancelReply={handleCancelReply}
        />
      </div>
    </div>
  );
};
