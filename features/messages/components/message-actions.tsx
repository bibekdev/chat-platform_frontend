import { PencilIcon, ReplyIcon, Trash2Icon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MessageWithDetails } from '../types';
import { ReactionButton } from './message-reactions';

interface MessageActionsProps {
  message: MessageWithDetails;
  isOwn: boolean;
  className?: string;
  onStartReply: (message: MessageWithDetails) => void;
  onStartEdit: (message: MessageWithDetails) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  onAddReaction: (messageId: string, reaction: string) => void;
}

export function MessageActions({
  message,
  isOwn,
  className,
  onStartReply,
  onStartEdit,
  onDeleteMessage,
  onAddReaction
}: MessageActionsProps) {
  if (message.isDeleted) return null;

  const canEdit = isOwn && !!message.content;

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity',
        className
      )}>
      <ReactionButton
        onSelect={emoji => onAddReaction(message.id, emoji)}
        align={isOwn ? 'end' : 'start'}
      />
      <button
        onClick={() => onStartReply?.(message)}
        className='p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'>
        <ReplyIcon className='size-3.5' />
      </button>
      {canEdit && (
        <button
          onClick={() => onStartEdit?.(message)}
          className='p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'>
          <PencilIcon className='size-3.5' />
        </button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors'>
            <Trash2Icon className='size-3.5' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isOwn ? 'end' : 'start'}
          side='top'>
          <DropdownMenuItem onClick={() => onDeleteMessage?.(message.id, false)}>
            Delete for me
          </DropdownMenuItem>
          {isOwn && (
            <DropdownMenuItem
              variant='destructive'
              onClick={() => onDeleteMessage?.(message.id, true)}>
              Delete for everyone
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
