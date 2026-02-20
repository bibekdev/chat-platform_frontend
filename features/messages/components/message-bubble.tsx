import Image from 'next/image';
import { format } from 'date-fns';
import {
  ArchiveIcon,
  BanIcon,
  CheckCheckIcon,
  CheckIcon,
  DownloadIcon,
  FileAudioIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  LucideIcon,
  ReplyIcon
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getUserInitials } from '@/lib/utils';
import { MessageAttachment, MessageWithDetails, MessageWithSender } from '../types';
import { MessageActions } from './message-actions';
import { ReactionDisplay } from './message-reactions';

interface MessageBubbleProps {
  message: MessageWithDetails;
  isOwn: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  isRead: boolean;
  onStartEdit: (message: MessageWithDetails) => void;
  onStartReply: (message: MessageWithDetails) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  onAddReaction: (messageId: string, reaction: string) => void;
  onToggleReaction: (messageId: string, reaction: string, hasReacted: boolean) => void;
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getFileMeta(mime: string): { icon: LucideIcon; bg: string } {
  if (mime === 'application/pdf') return { icon: FileTextIcon, bg: 'bg-red-500' };
  if (mime.startsWith('video/')) return { icon: FileVideoIcon, bg: 'bg-purple-500' };
  if (mime.startsWith('audio/')) return { icon: FileAudioIcon, bg: 'bg-amber-500' };
  if (
    mime.includes('zip') ||
    mime.includes('rar') ||
    mime.includes('tar') ||
    mime.includes('7z') ||
    mime.includes('compressed') ||
    mime.includes('archive')
  )
    return { icon: ArchiveIcon, bg: 'bg-yellow-600' };
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime === 'text/csv')
    return { icon: FileSpreadsheetIcon, bg: 'bg-green-600' };
  if (
    mime.startsWith('text/') ||
    mime.includes('document') ||
    mime.includes('msword') ||
    mime.includes('pdf')
  )
    return { icon: FileTextIcon, bg: 'bg-blue-500' };
  return { icon: FileIcon, bg: 'bg-muted-foreground' };
}

function FileAttachmentCard({ attachment }: { attachment: MessageAttachment }) {
  const { icon: Icon, bg } = getFileMeta(attachment.fileType);

  return (
    <a
      href={attachment.fileUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center gap-3 rounded-xl border bg-card p-2.5 min-w-52 hover:bg-accent transition-colors'>
      <div
        className={cn(
          'flex items-center justify-center size-10 rounded-lg shrink-0',
          bg
        )}>
        <Icon className='size-5 text-white' />
      </div>

      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium truncate text-foreground'>
          {attachment.fileName}
        </p>
        <p className='text-xs text-muted-foreground'>
          {formatFileSize(attachment.fileSize)}
        </p>
      </div>
      <DownloadIcon className='size-4 shrink-0 text-muted-foreground' />
    </a>
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
  onDeleteMessage,
  isRead,
  onAddReaction,
  onToggleReaction
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
  const hasReactions = message.reactions && message.reactions.length > 0;
  const corners = getBubbleCorners(
    isFirstInGroup,
    isLastInGroup,
    isOwn ? 'right' : 'left'
  );

  const attachments = hasAttachments && (
    <div className='space-y-1.5'>
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
            <FileAttachmentCard attachment={attachment} />
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
      {isOwn &&
        isLastInGroup &&
        (isRead ? (
          <CheckCheckIcon className='size-3 text-primary' />
        ) : (
          <CheckIcon className='size-3' />
        ))}
    </span>
  );

  const reactions = hasReactions && (
    <ReactionDisplay
      reactions={message.reactions!}
      isOwn={isOwn}
      onToggleReaction={(reaction, hasReacted) =>
        onToggleReaction(message.id, reaction, hasReacted)
      }
    />
  );

  const actions = (
    <MessageActions
      message={message}
      isOwn={isOwn}
      className={isOwn ? 'mr-1' : undefined}
      onStartReply={onStartReply}
      onStartEdit={onStartEdit}
      onDeleteMessage={onDeleteMessage}
      onAddReaction={onAddReaction}
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
          {message.content && (
            <div
              className={cn(
                'rounded-2xl px-3 py-2 text-sm wrap-break-word bg-primary text-primary-foreground',
                corners
              )}>
              <p>{message.content}</p>
            </div>
          )}
          {hasAttachments && (
            <div className={cn(message.content && 'mt-1.5')}>{attachments}</div>
          )}
          {reactions}
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
        {reactions}
        {timestamp}
      </div>
    </div>
  );
}
