'use client';

import React from 'react';

import { CheckIcon, PencilIcon, ReplyIcon, SendIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageWithDetails } from '../types';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  startTyping: () => void;
  editingMessage: { id: string; content: string } | null;
  onEditMessage: (content: string) => void;
  onCancelEdit: () => void;
  replyingToMessage: MessageWithDetails | null;
  onCancelReply: () => void;
}

export const MessageInput = ({
  onSendMessage,
  startTyping,
  editingMessage,
  onEditMessage,
  onCancelEdit,
  replyingToMessage,
  onCancelReply
}: MessageInputProps) => {
  const [content, setContent] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isEditing = !!editingMessage;

  const prevEditIdRef = React.useRef<string | null>(null);

  if (editingMessage?.id !== prevEditIdRef.current) {
    prevEditIdRef.current = editingMessage?.id || null;
    if (editingMessage) {
      setContent(editingMessage.content);
    }
  }

  React.useEffect(() => {
    if (editingMessage || replyingToMessage) {
      inputRef.current?.focus();
    }
  }, [editingMessage, replyingToMessage]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    requestAnimationFrame(() => {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) startTyping();
    setContent(e.target.value);
  };

  const handleSendMessage = () => {
    if (!content.trim()) return;

    if (isEditing && onEditMessage) {
      if (content.trim() === editingMessage.content) {
        onCancelEdit();
        return;
      }
      onEditMessage(content.trim());
    } else {
      onSendMessage(content.trim());
    }

    setContent('');
  };

  const handleCancel = () => {
    setContent('');
    onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === 'Escape') {
      if (isEditing) {
        e.preventDefault();
        handleCancel();
      } else if (replyingToMessage) {
        e.preventDefault();
        onCancelReply();
      }
    }
  };

  return (
    <div className='w-full flex flex-col gap-2'>
      {replyingToMessage && !isEditing && (
        <div className=' flex items-center gap-2 px-1 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-150'>
          <ReplyIcon className='size-3' />
          <div className='flex-1 min-w-0'>
            <span className='font-medium text-foreground'>
              {replyingToMessage.sender.name ?? 'Unknown'}
            </span>
            <p className='truncate'>{replyingToMessage.content ?? 'Attachment'}</p>
          </div>
          <button
            className='hover:text-foreground transition-colors'
            onClick={onCancelReply}>
            <XIcon className='size-3.5' />
          </button>
        </div>
      )}
      {isEditing && (
        <div className=' flex items-center gap-2 px-1 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-150'>
          <PencilIcon className='size-3' />
          <span className='flex-1 truncate'>Editing message...</span>
          <button
            className='hover:text-foreground transition-colors'
            onClick={handleCancel}>
            <XIcon className='size-3.5' />
          </button>
        </div>
      )}
      <div className='flex items-center gap-2'>
        <Input
          ref={inputRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={content}
          onFocus={handleFocus}
          className='h-10 focus-visible:ring-0 border-none focus-visible:ring-offset-0'
          placeholder='Type your message...'
        />
        <Button
          variant='default'
          size='icon'
          onClick={handleSendMessage}
          className='rounded-full size-10'>
          {isEditing ? <CheckIcon className='size-4' /> : <SendIcon className='size-4' />}
        </Button>
      </div>
    </div>
  );
};
