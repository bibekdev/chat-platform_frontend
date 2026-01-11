'use client';

import { UsersIcon } from 'lucide-react';

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useAllFriends } from '../../hooks';
import { FriendCard } from '../friend-card';

export const AllFriendsTab = () => {
  const { data, loadMoreRef, isFetchingNextPage } = useAllFriends();

  if (data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <UsersIcon className='size-10 text-muted-foreground' />
          </EmptyMedia>
          <EmptyTitle>No Friends Found</EmptyTitle>
          <EmptyDescription>
            You don&apos;t have any friends yet. Start adding friends to stay connected.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className='space-y-4'>
      {data.map(request => (
        <FriendCard
          key={request.id}
          data={request.friend}
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
