'use client';

import Image from 'next/image';

import React from 'react';

import {
  CheckIcon,
  FileIcon,
  PaperclipIcon,
  PencilIcon,
  ReplyIcon,
  SendIcon,
  XIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useUploadThing } from '@/lib/uploadthing';
import { MessageAttachment, MessageWithDetails } from '../types';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: MessageAttachment[]) => Promise<void>;
  startTyping: () => void;
  editingMessage: { id: string; content: string } | null;
  onEditMessage: (content: string) => Promise<void>;
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
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isEditing = !!editingMessage;

  const { startUpload, isUploading } = useUploadThing('messageAttachment');

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    e.target.value = '';

    try {
      const result = await startUpload(fileArray);
      if (result) {
        setUploadedFiles(prev => [
          ...prev,
          ...result.map(f => ({
            name: f.name,
            url: f.ufsUrl,
            type: f.type,
            size: f.size
          }))
        ]);
      }
    } catch (error) {
      // Upload failed - useUploadThing handles the error internally
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    const hasText = content.trim().length > 0;
    const hasAttachments = uploadedFiles.length > 0;

    if (isUploading) return;

    if (isEditing && onEditMessage) {
      if (!hasText || content.trim() === editingMessage.content) {
        onCancelEdit();
        return;
      }
      onEditMessage(content.trim());
      setContent('');
      return;
    }

    if (!hasText && !hasAttachments) return;

    const attachments: MessageAttachment[] | undefined = hasAttachments
      ? uploadedFiles.map(f => ({
          fileName: f.name,
          fileUrl: f.url,
          fileType: f.type,
          fileSize: f.size
        }))
      : undefined;

    onSendMessage(content, attachments);
    setContent('');
    setUploadedFiles([]);
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

      {(uploadedFiles.length > 0 || isUploading) && !isEditing && (
        <div className='flex items-center gap-2 px-1 overflow-x-auto animate-in fade-in slide-in-from-bottom-1 duration-150'>
          {uploadedFiles.map((file, i) => (
            <div
              key={i}
              className='relative group shrink-0'>
              {file.type.startsWith('image/') ? (
                <Image
                  src={file.url}
                  alt={file.name}
                  width={64}
                  height={64}
                  className='size-16 rounded-lg object-cover border'
                />
              ) : (
                <div className='flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs h-16'>
                  <FileIcon className='size-3.5 shrink-0 text-muted-foreground' />
                  <span className='max-w-20 truncate'>{file.name}</span>
                </div>
              )}
              <button
                onClick={() => handleRemoveFile(i)}
                className='absolute -top-1.5 -right-1.5 size-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                <XIcon className='size-2.5' />
              </button>
            </div>
          ))}

          {isUploading && (
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground h-16 px-2'>
              <Spinner className='size-4' />
              <span>Uploading...</span>
            </div>
          )}
        </div>
      )}

      <div className='flex items-center gap-2'>
        {!isEditing && (
          <>
            <input
              type='file'
              ref={fileInputRef}
              multiple
              className='hidden'
              onChange={handleFileSelect}
              accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar'
            />
            <Button
              variant={'ghost'}
              size={'icon'}
              className='rounded-full size-10 shrink-0'
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}>
              <PaperclipIcon className='size-4' />
            </Button>
          </>
        )}
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
