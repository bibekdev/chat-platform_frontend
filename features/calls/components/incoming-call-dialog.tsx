'use client';

import { PhoneIcon, PhoneOffIcon, VideoIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCall } from '@/hooks';
import { getUserInitials } from '@/lib/utils';

export function IncomingCallDialog() {
  const { incomingCall, acceptCall, rejectCall } = useCall();

  if (!incomingCall) return null;

  const displayName = incomingCall.conversationName ?? incomingCall.caller.name;
  const isVideo = incomingCall.mediaType === 'video';

  const callLabel = isVideo
    ? incomingCall.isGroup
      ? 'Group video call'
      : 'Incoming video call'
    : incomingCall.isGroup
      ? 'Group audio call'
      : 'Incoming audio call';

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200'>
      <div className='flex flex-col items-center gap-6 rounded-2xl bg-card border p-8 shadow-2xl w-80'>
        <div className='relative'>
          <div className='absolute inset-0 animate-ping rounded-full bg-primary/20' />
          <Avatar className='size-20 ring-4 ring-primary/30'>
            <AvatarImage src={incomingCall.caller.avatar} />
            <AvatarFallback className='text-xl'>
              {getUserInitials(incomingCall.caller.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className='text-center space-y-1'>
          <p className='text-lg font-semibold'>{displayName}</p>
          <p className='text-sm text-muted-foreground flex items-center justify-center gap-1.5'>
            {isVideo && <VideoIcon className='size-3.5' />}
            {callLabel}
          </p>
        </div>

        <div className='flex items-center gap-6'>
          <button
            onClick={rejectCall}
            className='flex flex-col items-center gap-1.5'>
            <div className='flex items-center justify-center size-14 rounded-full bg-destructive text-white hover:bg-destructive/90 transition-colors'>
              <PhoneOffIcon className='size-6' />
            </div>
            <span className='text-xs text-muted-foreground'>Decline</span>
          </button>

          <button
            onClick={acceptCall}
            className='flex flex-col items-center gap-1.5'>
            <div className='flex items-center justify-center size-14 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors'>
              {isVideo ? (
                <VideoIcon className='size-6' />
              ) : (
                <PhoneIcon className='size-6' />
              )}
            </div>
            <span className='text-xs text-muted-foreground'>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}
