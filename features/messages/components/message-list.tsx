'use client';

import { useEffect } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { MessageSquareIcon } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useAuthUser } from '@/features/auth/hooks';
import { useConversationById } from '@/features/conversations/hooks';
import { useGetMessages, useMarkAsRead, useReactions, useScrollAnchor } from '../hooks';
import { MessageWithDetails } from '../types';
import { MessageBubble } from './message-bubble';

interface MessageListProps {
  conversationId: string;
  onStartEdit: (message: MessageWithDetails) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  onStartReply: (message: MessageWithDetails) => void;
}

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

function formatTime(dateString: string) {
  return format(new Date(dateString), 'h:mm a');
}

function groupMessageByDate(messages: MessageWithDetails[]) {
  const groups: { date: string; messages: MessageWithDetails[] }[] = [];

  for (const message of messages) {
    const dateKey = format(new Date(message.createdAt), 'yyyy-MM-dd');
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ date: dateKey, messages: [message] });
    }
  }
  return groups;
}

export const MessageList = ({
  conversationId,
  onStartEdit,
  onDeleteMessage,
  onStartReply
}: MessageListProps) => {
  const { data: user } = useAuthUser();
  const { data, isLoading, loadMoreRef, isFetchingNextPage, error } =
    useGetMessages(conversationId);
  const { data: conversation } = useConversationById(conversationId);
  const { markAsRead } = useMarkAsRead(conversationId);
  const { addReaction, toggleReaction } = useReactions(conversationId);

  // Reverse for chronological order (API returns newest first)
  const messages = [...data].reverse();
  const messageGroups = groupMessageByDate(messages);

  const { scrollContainerRef, handleScroll } = useScrollAnchor({
    messageCount: messages.length,
    isLoading,
    isFetchingNextPage
  });

  const members = conversation?.members ?? [];

  const latestReadAt = members.reduce((latest, m) => {
    if (m.userId === user?.id || !m.lastReadAt) return latest;
    return Math.max(latest, new Date(m.lastReadAt).getTime());
  }, 0);

  const readMessageTimestamps = new Set<string>();
  if (user && latestReadAt > 0) {
    for (const msg of messages) {
      if (msg.senderId === user.id && new Date(msg.createdAt).getTime() <= latestReadAt) {
        readMessageTimestamps.add(msg.id);
      }
    }
  }

  // Auto-mark latest message as read when conversation is viewed
  useEffect(() => {
    if (!messages.length || !user) return;

    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.senderId !== user.id) {
      markAsRead(latestMessage.id);
    }
  }, [messages, user, markAsRead]);

  if (isLoading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <Spinner className='size-8 text-primary' />
          <p className='text-sm text-muted-foreground'>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <MessageSquareIcon className='size-10 text-destructive' />
            </EmptyMedia>
            <EmptyTitle>Failed to load messages</EmptyTitle>
            <EmptyDescription>{error.message || 'Something went wrong'}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <MessageSquareIcon className='size-10 text-muted-foreground' />
            </EmptyMedia>
            <EmptyTitle>No messages yet</EmptyTitle>
            <EmptyDescription>Send a message to start the conversation</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className='flex-1 overflow-y-auto'>
      <div className='flex flex-col gap-1 p-4'>
        <div
          ref={loadMoreRef}
          className='h-1'
        />

        {isFetchingNextPage && (
          <div className='flex justify-center py-3'>
            <Spinner className='size-5 text-primary' />
          </div>
        )}

        {messageGroups.map(group => (
          <div
            key={group.date}
            className='space-y-1'>
            {/* Date Separator */}
            <div className='flex items-center gap-3 py-3'>
              <div className='flex-1 h-px bg-border' />
              <span className='text-xs font-medium text-muted-foreground'>
                {formatDateLabel(group.date)}
              </span>
              <div className='flex-1 h-px bg-border' />
            </div>

            {/* Messages */}
            {group.messages.map((message, index) => {
              const isOwn = message.senderId === user?.id;
              const prevMessage = index > 0 ? group.messages[index - 1] : null;
              const nextMessage =
                index < group.messages.length - 1 ? group.messages[index + 1] : null;
              const isFirstInGroup = prevMessage?.senderId !== message.senderId;
              const isLastInGroup = nextMessage?.senderId !== message.senderId;
              const canEdit = isOwn && !message.isDeleted && message.content;
              const canDelete = !message.isDeleted;
              const canReply = !message.isDeleted;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  isRead={readMessageTimestamps.has(message.id)}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                  onStartEdit={onStartEdit}
                  onStartReply={onStartReply}
                  onDeleteMessage={onDeleteMessage}
                  onAddReaction={(messageId, reaction) =>
                    addReaction(messageId, reaction)
                  }
                  onToggleReaction={(messageId, reaction, hasReacted) =>
                    toggleReaction(messageId, reaction, hasReacted)
                  }
                />
              );
            })}
          </div>
        ))}

        <div className='h-1' />
      </div>
    </div>
  );
};
