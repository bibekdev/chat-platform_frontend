'use client';

import { UserPlusIcon } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useFriendRequestSent } from '../../hooks/useFriendRequestSent';
import { FriendRequestSentCard } from '../friend-sent-card';

export const FriendSentTab = () => {
  const { data, loadMoreRef, isFetchingNextPage } = useFriendRequestSent();

  // Data is prefetched on server, so no need for initial loading state
  // This prevents hydration mismatch
  if (data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <UserPlusIcon className='size-10 text-muted-foreground' />
          </EmptyMedia>
          <EmptyTitle>No Friend Requests Sent</EmptyTitle>
          <EmptyDescription>
            You don&apos;t have any friend requests sent yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className='space-y-4'>
      {data.map(request => (
        <FriendRequestSentCard
          key={request.id}
          requestId={request.id}
          receiver={request.receiver}
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
