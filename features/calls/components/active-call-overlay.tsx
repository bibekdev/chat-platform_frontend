'use client';

import { useEffect, useRef, useState } from 'react';

import {
  VideoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MicIcon,
  MicOffIcon,
  PhoneOffIcon,
  VideoOffIcon
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCall } from '@/hooks';
import { cn, getUserInitials } from '@/lib/utils';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function VideoFeed({
  stream,
  muted = false,
  mirrored = false,
  className
}: {
  stream: MediaStream | null;
  muted?: boolean;
  mirrored?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  if (
    !stream ||
    stream.getVideoTracks().length === 0 ||
    !stream.getVideoTracks().some(t => t.enabled)
  ) {
    return null;
  }

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={cn('bg-black object-cover', mirrored && 'scale-x-[-1]', className)}
    />
  );
}

export function ActiveCallOverlay() {
  const {
    callState,
    participants,
    isMuted,
    isVideoEnabled,
    mediaType,
    callDuration,
    isGroup,
    localStream,
    remoteStreams,
    endCall,
    toggleMute,
    toggleVideo
  } = useCall();
  const [minimized, setMinimized] = useState(false);

  if (callState === 'idle' || callState === 'ended') return null;

  const isVideo = mediaType === 'video';
  const participantList = Array.from(participants.values());
  const remoteEntries = Array.from(remoteStreams.entries());

  const statusLabel =
    callState === 'ringing'
      ? 'Ringing...'
      : callState === 'connecting'
        ? 'Connecting...'
        : formatDuration(callDuration);

  if (minimized) {
    return (
      <div className='fixed top-4 right-4 z-90 aniamte-in slide-in-from-top-2 duration-200'>
        <button className='flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors'>
          <div className='size-2 rounded-full bg-green-400 animate-pulse' />
          <span className='text-sm font-medium'>{statusLabel}</span>
          {isVideo && <VideoIcon className='size-3.5' />}
          <ChevronDownIcon className='size-4' />
        </button>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className='fixed top-4 right-4 z-90 animate-in slide-in-from-top-2 duration-200'>
        <div className='w-96 rounded-2xl bg-card border shadow-2xl overflow-hidden'>
          <div className='flex items-center justify-between px-4 py-3 bg-primary/5 border-b'>
            <div className='flex items-center gap-2'>
              <div className='size-2 rounded-full bg-green-500 animate-pulse' />{' '}
              <span className='text-sm font-medium'>
                {isGroup ? 'Group Video Call' : 'Video Call'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-mono text-muted-foreground'>
                {statusLabel}
              </span>
              <button
                onClick={() => setMinimized(true)}
                className='p-0.5 rounded hover:bg-muted transition-colors'>
                <ChevronUpIcon className='size-4 text-muted-foreground' />
              </button>
            </div>
          </div>

          <div className='relative bg-black aspect-video'>
            {remoteEntries.length > 0 ? (
              <div
                className={cn(
                  'grid size-full',
                  remoteEntries.length === 1 && 'grid-cols-1',
                  remoteEntries.length === 2 && 'grid-cols-2',
                  remoteEntries.length >= 3 && 'grid-cols-2 grid-rows-2'
                )}>
                {remoteEntries.map(([peerId, stream]) => {
                  const user = participants.get(peerId);
                  const hasVideo = stream.getVideoTracks().some(t => t.enabled);

                  return hasVideo ? (
                    <VideoFeed
                      key={peerId}
                      stream={stream}
                      className='size-full'
                    />
                  ) : (
                    <div
                      key={peerId}
                      className='flex flex-col items-center justify-center gap-2 bg-muted/10'>
                      <Avatar className='size-16'>
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className='text-lg text-white bg-muted-foreground/30'>
                          {getUserInitials(user?.name ?? '?')}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-xs text-white/70'>{user?.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-full gap-2'>
                {participantList.length > 0 ? (
                  participantList.map(user => (
                    <div
                      key={user.id}
                      className='flex flex-col items-center gap-2'>
                      <Avatar className='size-16'>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className='text-lg text-white bg-muted-foreground/30'>
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-xs text-white/70'>{user.name}</span>
                    </div>
                  ))
                ) : callState === 'connected' ? (
                  <>
                    <div className='size-10 rounded-full bg-green-500/20 flex items-center justify-center'>
                      <VideoIcon className='size-5 text-green-400' />
                    </div>
                    <p className='text-xs text-white/60'>Call connected</p>
                  </>
                ) : (
                  <>
                    <div className='flex gap-1'>
                      <div className='size-2 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]' />
                      <div className='size-2 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]' />
                      <div className='size-2 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]' />
                    </div>
                    <p className='text-xs text-white/60'>
                      {callState === 'ringing'
                        ? 'Waiting for answer...'
                        : 'Connecting...'}
                    </p>
                  </>
                )}
              </div>
            )}

            {localStream && isVideoEnabled && (
              <div className='absolute top-2 right-2 z-20 w-28 aspect-video rounded-lg overflow-hidden border-2 border-white/20 shadow-lg'>
                <VideoFeed
                  stream={localStream}
                  muted
                  mirrored
                  className='w-full h-full'
                />
              </div>
            )}

            <div className='absolute inset-x-0 bottom-0 z-30 flex items-center justify-center gap-3 px-4 py-3 bg-linear-to-t from-black/80 to-transparent'>
              <Button
                variant='ghost'
                size='icon'
                className={cn(
                  'rounded-full size-10 border',
                  isMuted
                    ? 'bg-red-500/90 hover:bg-red-600 border-red-500 text-white'
                    : 'bg-white/20 hover:bg-white/30 border-white/20 text-white'
                )}
                onClick={toggleMute}>
                {isMuted ? (
                  <MicOffIcon className='size-5' />
                ) : (
                  <MicIcon className='size-5' />
                )}
              </Button>

              <Button
                variant='ghost'
                size='icon'
                className={cn(
                  'rounded-full size-10 border',
                  !isVideoEnabled
                    ? 'bg-red-500/90 hover:bg-red-600 border-red-500 text-white'
                    : 'bg-white/20 hover:bg-white/30 border-white/20 text-white'
                )}
                onClick={toggleVideo}>
                {isVideoEnabled ? (
                  <VideoIcon className='size-5' />
                ) : (
                  <VideoOffIcon className='size-5' />
                )}
              </Button>

              <Button
                variant='ghost'
                size='icon'
                className='rounded-full size-10 bg-red-500 hover:bg-red-600 text-white border border-red-500'
                onClick={endCall}>
                <PhoneOffIcon className='size-5' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Audio-only call (unchanged layout)
  return (
    <div className='fixed top-4 right-4 z-90 animate-in slide-in-from-top-2 duration-200'>
      <div className='w-72 rounded-2xl bg-card border shadow-2xl overflow-hidden'>
        <div className='flex items-center justify-between px-4 py-3 bg-primary/5 border-b'>
          <div className='flex items-center gap-2'>
            <div className='size-2 rounded-full bg-green-500 animate-pulse' />
            <span className='text-sm font-medium'>
              {isGroup ? 'Group Call' : 'Audio Call'}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs font-mono text-muted-foreground'>{statusLabel}</span>
            <button
              onClick={() => setMinimized(true)}
              className='p-0.5 rounded hover:bg-muted transition-colors'>
              <ChevronUpIcon className='size-4 text-muted-foreground' />
            </button>
          </div>
        </div>

        <div className='p-4'>
          {participantList.length > 0 ? (
            <div
              className={cn(
                'grid gap-3',
                participantList.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              )}>
              {participantList.map(user => (
                <div
                  key={user.id}
                  className='flex flex-col items-center gap-1.5'>
                  <Avatar className='size-12'>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className='text-sm'>
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-xs text-muted-foreground truncate max-w-full'>
                    {user.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2 py-2'>
              {callState === 'connected' ? (
                <>
                  <div className='size-10 rounded-full bg-green-500/10 flex items-center justify-center'>
                    <MicIcon className='size-5 text-green-500' />
                  </div>
                  <p className='text-xs text-muted-foreground'>Call connected</p>
                </>
              ) : (
                <>
                  <div className='flex gap-1'>
                    <div className='size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]' />
                    <div className='size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]' />
                    <div className='size-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]' />
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {callState === 'ringing' ? 'Waiting for answer...' : 'Connecting...'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className='flex items-center justify-center gap-3 px-4 pb-4'>
          <Button
            variant={isMuted ? 'destructive' : 'outline'}
            size='icon'
            className='rounded-full size-10'
            onClick={toggleMute}>
            {isMuted ? <MicOffIcon className='size-5' /> : <MicIcon className='size-5' />}
          </Button>

          <Button
            variant='destructive'
            size='icon'
            className='rounded-full size-10'
            onClick={endCall}>
            <PhoneOffIcon className='size-5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
