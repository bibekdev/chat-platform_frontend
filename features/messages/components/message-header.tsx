'use client';

import { useParams } from 'next/navigation';

import { MoreVerticalIcon, PhoneIcon, VideoIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useConversationById } from '@/features/conversations/hooks';
import { getUserInitials } from '@/lib/utils';

export const MessageHeader = () => {
  const { conversationId } = useParams();

  const { data } = useConversationById(conversationId as string);

  return (
    <div className='border-b p-4 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Avatar className='size-13 bg-primary/50'>
          <AvatarImage src={data?.avatarUrl || ''} />
          <AvatarFallback>{getUserInitials(data?.name || '')}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-3'>
          <p className='font-semibold text-xl'>{data?.name}</p>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='icon'>
          <PhoneIcon className='size-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'>
          <VideoIcon className='size-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'>
          <MoreVerticalIcon className='size-4' />
        </Button>
      </div>
    </div>
  );
};
