'use client';

import Image from 'next/image';
import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { BanIcon, MessageSquareIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useAuthUser } from '@/features/auth/hooks';
import { cn, getUserInitials } from '@/lib/utils';
import { useGetMessages } from '../hooks';
import { MessageWithDetails } from '../types';

interface MessageListProps {
  conversationId: string;
  onStartEdit: (message: MessageWithDetails) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
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
  onDeleteMessage
}: MessageListProps) => {
  const { data: user } = useAuthUser();
  const { data, isLoading, loadMoreRef, isFetchingNextPage, error } =
    useGetMessages(conversationId);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const isNearBottomRef = React.useRef(true);
  const prevMessageCountRef = React.useRef(0);
  const initialScrollDoneRef = React.useRef(false);
  const wasLoadingMoreRef = React.useRef(false);
  const savedScrollMetricsRef = React.useRef({ scrollHeight: 0, scrollTop: 0 });

  // Reverse for chronological order (API returns newest first)
  const messages = [...data].reverse();
  const messageGroups = groupMessageByDate(messages);

  // Continously track whether user is near the bottom (used before DOM updates)
  const handleScroll = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    }
  }, []);

  React.useEffect(() => {
    if (isFetchingNextPage) {
      wasLoadingMoreRef.current = true;
      const el = scrollContainerRef.current;
      if (el) {
        savedScrollMetricsRef.current = {
          scrollHeight: el.scrollHeight,
          scrollTop: el.scrollTop
        };
      }
    }
  }, [isFetchingNextPage]);

  // Handle scroll position after DOM updates (run before browser paints)
  React.useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    if (!initialScrollDoneRef.current && currentCount > 0 && !isLoading) {
      // Initial load: scroll to bottom
      el.scrollTop = el.scrollHeight;
      initialScrollDoneRef.current = true;
    } else if (wasLoadingMoreRef.current && !isFetchingNextPage) {
      // Older messages loaded: maintain scroll position so viewport doesn't jump
      wasLoadingMoreRef.current = false;
      const addedHeight = el.scrollHeight - savedScrollMetricsRef.current.scrollHeight;
      el.scrollTop = savedScrollMetricsRef.current.scrollTop + addedHeight;
    } else if (currentCount > prevCount && prevCount > 0) {
      // New message arrived: auto-scroll to bottom if user was near the end
      if (isNearBottomRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages.length, isLoading, isFetchingNextPage]);

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

              // -------- Deleted for everyone placeholder ---------
              if (message.isDeleted && message.deletedForEveryone) {
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      isOwn ? 'justify-end' : 'justify-start',
                      isOwn ? '' : 'pl-10',
                      isFirstInGroup && 'mt-3'
                    )}>
                    <div className='flex items-center gap-1.5 rounded-2xl border border-dashed border-border px-3 py-2 text-sm italic text-muted-foreground'>
                      <BanIcon className='size-3.5' />
                      <span>This message was deleted</span>
                    </div>
                  </div>
                );
              }

              if (isOwn) {
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'group/msg flex justify-end',
                      isFirstInGroup && 'mt-3'
                    )}>
                    {canDelete && (
                      <div className='flex items-center gap-0.5 mr-1 opacity-0 group-hover/msg:opacity-100 transition-opacity'>
                        {canEdit && (
                          <button
                            onClick={() => onStartEdit(message)}
                            className='p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors'>
                            <PencilIcon className='size-3.5' />
                          </button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            className='focus-visible:outline-0'>
                            <button className='p-1 rounded-md text-muted-foreground hover:text-destructive transition-colors'>
                              <Trash2Icon className='size-3.5' />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align='end'
                            side='top'>
                            <DropdownMenuItem
                              onClick={() => onDeleteMessage(message.id, false)}>
                              Delete for me
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant='destructive'
                              onClick={() => onDeleteMessage(message.id, true)}>
                              Delete for everyone
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}

                    <div className='flex flex-col items-end max-w-[70%]'>
                      <div
                        className={cn(
                          'rounded-2xl px-3 py-2 text-sm wrap-break-word bg-primary text-primary-foreground',
                          isFirstInGroup && isLastInGroup && 'rounded-r-md',
                          isFirstInGroup && !isLastInGroup && 'rounded-tr-md',
                          isLastInGroup && !isFirstInGroup && 'rounded-br-md',
                          !isFirstInGroup && !isLastInGroup && 'rounded-r-md'
                        )}>
                        <p>{message.content}</p>

                        {message.attachments && message.attachments.length > 0 && (
                          <div className={cn('space-y-1', message.content && 'mt-1')}>
                            {message.attachments.map((attachment, i) => (
                              <div key={i}>
                                {attachment.fileType.startsWith('image/') ? (
                                  <Image
                                    src={attachment.fileUrl}
                                    alt={attachment.fileName}
                                    width={400}
                                    height={256}
                                    className='rounded-lg max-w-full max-h-64 object-cover'
                                  />
                                ) : (
                                  <a
                                    href={attachment.fileUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-2 text-xs underline text-primary-foreground/80'>
                                    {attachment.fileName}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className='text-[10px] text-muted-foreground mt-0.5 mr-1'>
                        {message.isEdited && <span className='italic mr-1'>edited</span>}
                        {isLastInGroup && formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              }

              // --- Other user's message (left side) ---
              return (
                <div
                  key={message.id}
                  className={cn(
                    'group/msg flex items-end gap-2 justify-start',
                    isFirstInGroup && 'mt-3'
                  )}>
                  {/* Avatar - only visible on last message in group*/}
                  <div className='w-8 shrink-0'>
                    {isLastInGroup && (
                      <Avatar className='size-8 bg-primary/40'>
                        <AvatarImage
                          src={message.sender.avatar}
                          alt={message.sender.name}
                        />
                        <AvatarFallback className='text-xs'>
                          {getUserInitials(message.sender.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div className='flex flex-col items-start max-w-[70%]'>
                    {isFirstInGroup && (
                      <span className='text-xs font-medium text-muted-foreground mb-1 ml-1'>
                        {message.sender.name}
                      </span>
                    )}

                    <div className='flex items-center gap-0.5'>
                      <div
                        className={cn(
                          'rounded-2xl px-3 py-2 text-sm wrap-break-word bg-muted',
                          isFirstInGroup && isLastInGroup && 'rounded-l-md',
                          isFirstInGroup && !isLastInGroup && 'rounded-tl-md',
                          isLastInGroup && !isFirstInGroup && 'rounded-bl-md',
                          !isFirstInGroup && !isLastInGroup && 'rounded-l-md'
                        )}>
                        {message.content && <p>{message.content}</p>}

                        {message.attachments && message.attachments.length > 0 && (
                          <div className={cn('space-y-1', message.content && 'mt-1')}>
                            {message.attachments.map((attachment, i) => (
                              <div key={i}>
                                {attachment.fileType.startsWith('image/') ? (
                                  <Image
                                    src={attachment.fileUrl}
                                    alt={attachment.fileName}
                                    width={400}
                                    height={256}
                                    className='rounded-lg max-w-full max-h-64 object-cover'
                                  />
                                ) : (
                                  <a
                                    href={attachment.fileUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex items-center gap-2 text-xs underline text-muted-foreground'>
                                    {attachment.fileName}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {canDelete && (
                        <div className='opacity-0 group-hover/msg:opacity-100 transition-opacity'>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              className='focus-visible:outline-0'>
                              <button className='p-1 rounded-md text-muted-foreground hover:text-destructive transition-colors'>
                                <Trash2Icon className='size-3.5' />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align='start'
                              side='top'>
                              <DropdownMenuItem
                                onClick={() => onDeleteMessage(message.id, false)}>
                                Delete for me
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>

                    <span className='text-[10px] text-muted-foreground mt-0.5 mr-1'>
                      {message.isEdited && <span className='italic mr-1'>edited</span>}
                      {isLastInGroup && formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Bottom anchor for auto scroll */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
