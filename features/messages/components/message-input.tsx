'use client';

import React from 'react';

import { SendIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  startTyping: () => void;
}

export const MessageInput = ({ onSendMessage, startTyping }: MessageInputProps) => {
  const [content, setContent] = React.useState('');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    requestAnimationFrame(() => {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTyping();
    setContent(e.target.value);
  };

  const handleSendMessage = () => {
    if (!content.trim()) return;
    onSendMessage(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='w-full flex items-center gap-2'>
      <Input
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
        <SendIcon className='size-4' />
      </Button>
    </div>
  );
};
