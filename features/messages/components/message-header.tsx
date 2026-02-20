'use client';

import { useState } from 'react';
import { MoreVerticalIcon, PhoneIcon, VideoIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ConversationSettings, GroupAvatar } from '@/features/conversations/components';
import { useConversationById } from '@/features/conversations/hooks';
import { getUserInitials } from '@/lib/utils';

interface MessageHeaderProps {
  conversationId: string;
}

export const MessageHeader = ({ conversationId }: MessageHeaderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data } = useConversationById(conversationId);

  const isGroup = data?.type === 'group';
  const memberCount = data?.members?.length ?? 0;

  const memberAvatars =
    data?.members?.slice(0, 4).map(m => ({ avatar: m.user.avatar, name: m.user.name })) ??
    [];

  return (
    <>
      <div className='border-b p-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {isGroup ? (
            <GroupAvatar
              avatars={memberAvatars}
              avatarUrl={data?.avatarUrl}
              size={44}
            />
          ) : (
            <Avatar className='size-11 bg-primary/10'>
              <AvatarImage src={data?.avatarUrl || ''} />
              <AvatarFallback>{getUserInitials(data?.name || '')}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <p className='font-semibold text-lg'>{data?.name}</p>
            {isGroup && memberCount > 0 && (
              <p className='text-xs text-muted-foreground'>{memberCount} members</p>
            )}
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
            size='icon'
            onClick={() => setSettingsOpen(true)}>
            <MoreVerticalIcon className='size-4' />
          </Button>
        </div>
      </div>

      {data && (
        <ConversationSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          conversation={data}
        />
      )}
    </>
  );
};
