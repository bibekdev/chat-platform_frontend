import React from 'react';

import { useAuthUser } from '@/features/auth/hooks';
import { MessageAttachment, MessageType, MessageWithDetails } from '../types';
import { useDeleteMessage } from './useDeleteMessage';
import { useEditMessage } from './useEditMessage';
import { useSendMessage } from './useSendMessage';
import { useTypingIndicator } from './useTypingIndicator';

export function useMessageActions(conversationId: string) {
  const { data: user } = useAuthUser();
  const [editingMessage, setEditingMessage] = React.useState<{
    id: string;
    content: string;
  } | null>(null);
  const [replyingToMessage, setReplyingToMessage] =
    React.useState<MessageWithDetails | null>(null);

  const { sendMessageOptimistic } = useSendMessage(conversationId);
  const { editMessage } = useEditMessage(conversationId);
  const { deleteMessage } = useDeleteMessage(conversationId);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(conversationId);

  const handleSendMessage = async (
    content: string,
    attachments?: MessageAttachment[]
  ) => {
    if (!user) return;
    stopTyping();
    const replyTo = replyingToMessage;
    setReplyingToMessage(null);

    const type: MessageType = attachments?.length
      ? inferMessageType(attachments)
      : 'text';

    await sendMessageOptimistic(
      { content, type: 'text', replyToId: replyTo?.id, attachments },
      { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      replyTo ?? undefined
    );
  };

  const handleStartReply = (message: MessageWithDetails) => {
    setReplyingToMessage(message);
    setEditingMessage(null);
  };

  const handleCancelReply = () => {
    setReplyingToMessage(null);
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

  const handleDeleteMessage = async (messageId: string, forEveryone: boolean) => {
    if (editingMessage?.id === messageId) {
      setEditingMessage(null);
    }
    await deleteMessage({ messageId, forEveryone });
  };

  return {
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
  };
}

function inferMessageType(attachments: MessageAttachment[]): MessageType {
  const mime = attachments[0]?.fileType ?? '';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';

  return 'file';
}
