'use client';

import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Conversation } from '@/features/conversations/types';
import { cn, getUserInitials } from '@/lib/utils';

interface ConversationCardProps {
  conversation: Conversation;
  onClick?: (conversation: Conversation) => void;
}

export function ConversationCard({ conversation, onClick }: ConversationCardProps) {
  const { conversationId } = useParams();

  const isGroup = conversation.type === 'group';
  const displayName = conversation.name || 'Direct Message';
  const lastMessageContent = conversation.lastMessage?.content;
  const lastMessageTime = conversation.lastMessage?.createdAt
    ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
        addSuffix: true
      })
    : null;

  const isActive = conversation.id === conversationId;

  return (
    <Card
      className={cn(
        'flex-row items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-secondary border-none bg-transparent shadow-none',
        onClick && 'cursor-pointer',
        isActive && 'bg-secondary'
      )}
      onClick={() => onClick?.(conversation)}>
      {/* Avatar */}
      <div className='relative'>
        <Avatar className='size-12 bg-primary/10'>
          {isGroup ? (
            <>
              <AvatarImage src={conversation.avatarUrl || undefined} />
              <AvatarFallback>
                <Users className='size-5 text-muted-foreground' />
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src={conversation.avatarUrl || undefined} />
              <AvatarFallback>{getUserInitials(displayName)}</AvatarFallback>
            </>
          )}
        </Avatar>
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='font-medium truncate'>{displayName}</h3>
          {lastMessageTime && (
            <span className='text-xs text-muted-foreground whitespace-nowrap'>
              {lastMessageTime}
            </span>
          )}
        </div>

        {/* Last message preview */}
        <div className='flex items-center gap-1 mt-0.5'>
          {conversation.lastMessage?.sender && (
            <span className='text-sm text-muted-foreground truncate'>
              {isGroup && (
                <span className='font-medium'>
                  {conversation.lastMessage.sender.name}:{' '}
                </span>
              )}
              {lastMessageContent || getMessageTypeLabel(conversation.lastMessage.type)}
            </span>
          )}
          {!conversation.lastMessage && (
            <span className='text-sm text-muted-foreground italic'>No messages yet</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function getMessageTypeLabel(type: string): string {
  switch (type) {
    case 'image':
      return 'Sent an image';
    case 'file':
      return 'Sent a file';
    case 'audio':
      return 'Sent an audio';
    case 'video':
      return 'Sent a video';
    case 'system':
      return 'System message';
    default:
      return '';
  }
}
