import Image from 'next/image';
import { format } from 'date-fns';
import { BanIcon, ReplyIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getUserInitials } from '@/lib/utils';
import { MessageWithDetails, MessageWithSender } from '../types';
import { MessageActions } from './message-actions';

interface MessageBubbleProps {
  message: MessageWithDetails;
  isOwn: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onStartEdit: (message: MessageWithDetails) => void;
  onStartReply: (message: MessageWithDetails) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
}

function formatTime(dateString: string) {
  return format(new Date(dateString), 'h:mm a');
}

function ReplyQuote({
  replyTo,
  className
}: {
  replyTo: MessageWithSender;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-1 max-w-full rounded-xl px-3 py-1.5 text-xs text-muted-foreground',
        className
      )}>
      <div className='flex gap-2 items-center'>
        <ReplyIcon className='rotate-180 size-5' />
        <div>
          <span className='font-medium text-foreground'>
            {replyTo.sender?.name ?? 'Unknown'}
          </span>
          <p className='truncate'>
            {replyTo.isDeleted
              ? 'This message was deleted'
              : (replyTo.content ?? 'Attachment')}
          </p>
        </div>
      </div>
    </div>
  );
}

function getBubbleCorners(
  isFirstInGroup: boolean,
  isLastInGroup: boolean,
  side: 'left' | 'right'
) {
  const alone = isFirstInGroup && isLastInGroup;
  const first = isFirstInGroup && !isLastInGroup;
  const last = isLastInGroup && !isFirstInGroup;
  const middle = !isFirstInGroup && !isLastInGroup;

  if (side === 'right') {
    return cn(
      alone && 'rounded-r-md',
      first && 'rounded-tr-md',
      last && 'rounded-br-md',
      middle && 'rounded-r-md'
    );
  }

  return cn(
    alone && 'rounded-l-md',
    first && 'rounded-tl-md',
    last && 'rounded-bl-md',
    middle && 'rounded-l-md'
  );
}

export function MessageBubble({
  message,
  isOwn,
  isFirstInGroup,
  isLastInGroup,
  onStartEdit,
  onStartReply,
  onDeleteMessage
}: MessageBubbleProps) {
  if (message.isDeleted && message.deletedForEveryone) {
    return (
      <div
        className={cn(
          'flex',
          isOwn ? 'justify-end' : 'justify-start',
          !isOwn && 'pl-10',
          isFirstInGroup && 'mt-3'
        )}>
        <div className='flex items-center gap-1.5 rounded-2xl border border-dashed border-border px-3 py-2 text-sm italic text-muted-foreground'>
          <BanIcon className='size-3.5' />
          <span>This message was deleted</span>
        </div>
      </div>
    );
  }

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const corners = getBubbleCorners(
    isFirstInGroup,
    isLastInGroup,
    isOwn ? 'right' : 'left'
  );

  const attachments = hasAttachments && (
    <div className={cn('space-y-1', message.content && 'mt-1')}>
      {message.attachments!.map((attachment, i) => (
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
              className={cn(
                'flex items-center gap-2 text-xs underline',
                isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}>
              {attachment.fileName}
            </a>
          )}
        </div>
      ))}
    </div>
  );

  const timestamp = (message.isEdited || isLastInGroup) && (
    <span
      className={cn('text-[10px] text-muted-foreground mt-0.5', isOwn ? 'mr-1' : 'ml-1')}>
      {message.isEdited && <span className='italic mr-1'>edited</span>}
      {isLastInGroup && formatTime(message.createdAt)}
    </span>
  );

  const actions = (
    <MessageActions
      message={message}
      isOwn={isOwn}
      className={isOwn ? 'mr-1' : undefined}
      onStartReply={onStartReply}
      onStartEdit={onStartEdit}
      onDeleteMessage={onDeleteMessage}
    />
  );

  if (isOwn) {
    return (
      <div className={cn('group/msg flex justify-end', isFirstInGroup && 'mt-3')}>
        {actions}
        <div className='flex flex-col items-end max-w-[70%]'>
          {message.replyTo && (
            <ReplyQuote
              replyTo={message.replyTo}
              className='bg-primary/10'
            />
          )}
          <div
            className={cn(
              'rounded-2xl px-3 py-2 text-sm wrap-break-word bg-primary text-primary-foreground',
              corners
            )}>
            {message.content && <p>{message.content}</p>}
            {attachments}
          </div>
          {timestamp}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group/msg flex items-end gap-2 justify-start',
        isFirstInGroup && 'mt-3'
      )}>
      <div className='w-8 shrink-0'>
        {isLastInGroup && (
          <Avatar className='size-8'>
            <AvatarImage
              src={message.sender?.avatar}
              alt={message.sender?.name}
            />
            <AvatarFallback className='text-xs'>
              {getUserInitials(message.sender?.name ?? '')}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      <div className='flex flex-col items-start max-w-[70%]'>
        {isFirstInGroup && (
          <span className='text-xs font-medium text-muted-foreground mb-1 ml-1'>
            {message.sender?.name}
          </span>
        )}
        {message.replyTo && (
          <ReplyQuote
            replyTo={message.replyTo}
            className='bg-muted/60'
          />
        )}
        <div className='flex items-center gap-0.5'>
          <div
            className={cn(
              'rounded-2xl px-3 py-2 text-sm wrap-break-word bg-muted',
              corners
            )}>
            {message.content && <p>{message.content}</p>}
            {attachments}
          </div>
          {actions}
        </div>
        {timestamp}
      </div>
    </div>
  );
}
