'use client';

import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Conversation } from '@/features/conversations/types';
import { useOnlinePresence } from '@/hooks';
import { cn, getUserInitials } from '@/lib/utils';
import { GroupAvatar } from '../group-avatar';

interface ConversationCardProps {
  conversation: Conversation;
  onClick?: (conversation: Conversation) => void;
}

export function ConversationCard({ conversation, onClick }: ConversationCardProps) {
  const { conversationId } = useParams();
  const { isUserOnline } = useOnlinePresence();

  const isGroup = conversation.type === 'group';
  const displayName = conversation.name || 'Direct Message';
  const lastMessageContent = conversation.lastMessage?.content;
  const lastMessageTime = conversation.lastMessage?.createdAt
    ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
        addSuffix: true
      })
    : null;

  const isActive = conversation.id === conversationId;
  const hasUnread = (conversation.unreadCount ?? 0) > 0;

  const isDmOnline =
    !isGroup && conversation.otherParticipant
      ? isUserOnline(conversation.otherParticipant.id)
      : false;

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
              <GroupAvatar
                avatars={conversation.memberAvatars ?? []}
                avatarUrl={conversation.avatarUrl}
                size={48}
              />
            </>
          ) : (
            <div className='relative overflow-visible'>
              <Avatar className='size-12 bg-primary/10'>
                <AvatarImage src={conversation.avatarUrl || undefined} />
                <AvatarFallback>{getUserInitials(displayName)}</AvatarFallback>
              </Avatar>
              {isDmOnline && (
                <span className='absolute z-10 bottom-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-background' />
              )}
            </div>
          )}
        </Avatar>
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='font-medium truncate'>{displayName}</h3>
          {lastMessageTime && (
            <span
              className={cn(
                'text-xs whitespace-nowrap',
                hasUnread ? 'text-primary font-medium' : 'text-muted-foreground'
              )}>
              {lastMessageTime}
            </span>
          )}
        </div>

        {/* Last message preview */}
        <div className='flex items-center gap-1 mt-0.5'>
          <span
            className={cn(
              'text-sm truncate flex-1',
              hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
            {conversation.lastMessage?.sender ? (
              <>
                {isGroup && (
                  <span className='font-medium'>
                    {conversation.lastMessage.sender.name}:{' '}
                  </span>
                )}
                {lastMessageContent || getMessageTypeLabel(conversation.lastMessage.type)}
              </>
            ) : (
              !conversation.lastMessage && (
                <span className='italic text-muted-foreground'>No messages yet</span>
              )
            )}
          </span>
          {hasUnread && (
            <span className='flex items-center justify-center min-w-5 h-5 rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground'>
              {conversation.unreadCount! > 99 ? '99+' : conversation.unreadCount}
            </span>
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
