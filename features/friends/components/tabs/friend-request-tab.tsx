'use client';

import { UserPlusIcon } from 'lucide-react';

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useFriendRequestReceived } from '../../hooks/useFriendRequestReceived';
import { FriendRequestReceivedCard } from '../friend-request-card';

export const FriendRequestTab = () => {
  const { data, loadMoreRef, isFetchingNextPage } = useFriendRequestReceived();

  if (data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <UserPlusIcon className='size-10 text-muted-foreground' />
          </EmptyMedia>
          <EmptyTitle>No Friends Request Received</EmptyTitle>
          <EmptyDescription>
            You don&apos;t have any friends request received yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className='space-y-4'>
      {data.map(request => (
        <FriendRequestReceivedCard
          key={request.id}
          requestId={request.id}
          sender={request.sender}
        />
      ))}
      <div
        ref={loadMoreRef}
        className='h-1'
      />
      {isFetchingNextPage && (
        <div className='flex justify-center py-4'>
          <Spinner className='stroke-primary' />
        </div>
      )}
    </div>
  );
};
