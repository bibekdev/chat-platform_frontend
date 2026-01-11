import { dehydrate, HydrationBoundary, InfiniteData } from '@tanstack/react-query';
import { UserPlusIcon, UsersIcon } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AllFriendsTab, FriendRequestTab } from '@/features/friends/components/tabs';
import { FriendSentTab } from '@/features/friends/components/tabs';
import {
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests
} from '@/features/friends/server';
import {
  Friend,
  FriendRequestWithReceiver,
  FriendRequestWithSender
} from '@/features/friends/types';
import { UserSuggestionsPanel } from '@/features/users/components/user-suggestions-panel';
import { getUserSuggestions } from '@/features/users/server';
import { UserSuggestion } from '@/features/users/types';
import { getServerQueryClient } from '@/lib/queryClient-server';
import { queryKeys } from '@/lib/queryKeys';
import { PaginatedResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

const FriendsPage = async () => {
  const queryClient = getServerQueryClient();

  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.friends.friends(),
      queryFn: getFriends,
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage: PaginatedResponse<Friend>) =>
        lastPage.pagination.nextCursor
    }),

    queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.friends.incomingRequests(),
      queryFn: getIncomingFriendRequests,
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage: PaginatedResponse<FriendRequestWithSender>) =>
        lastPage.pagination.nextCursor
    }),

    queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.friends.outgoingRequests(),
      queryFn: getOutgoingFriendRequests,
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage: PaginatedResponse<FriendRequestWithReceiver>) =>
        lastPage.pagination.nextCursor
    }),

    queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.user.suggestions(),
      queryFn: getUserSuggestions,
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage: PaginatedResponse<UserSuggestion>) =>
        lastPage.pagination.nextCursor
    })
  ]);

  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.friends.friends(),
    queryFn: getFriends,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: PaginatedResponse<Friend>) =>
      lastPage.pagination.nextCursor
  });

  const friends = queryClient.getQueryData<InfiniteData<PaginatedResponse<Friend>>>(
    queryKeys.friends.friends()
  );
  const incomingRequests = queryClient.getQueryData<
    InfiniteData<PaginatedResponse<FriendRequestWithSender>>
  >(queryKeys.friends.incomingRequests());

  const allFriends = friends?.pages.flatMap(page => page.data) ?? [];
  const allIncomingRequests = incomingRequests?.pages.flatMap(page => page.data) ?? [];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mb-12'>
          <h1 className='text-3xl font-medium tracking-tight'>Friends</h1>
          <p className='mt-2 text-base text-muted-foreground'>
            Stay connected with your network
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8'>
          {/* Main Content - Tabs */}
          <Tabs
            defaultValue='all'
            className='w-full'>
            <TabsList className='grid w-full grid-cols-4 mb-8 bg-muted/50 p-1'>
              <TabsTrigger
                value='all'
                className='text-sm'>
                All Friends
              </TabsTrigger>
              <TabsTrigger
                value='online'
                className='text-sm'>
                Online
              </TabsTrigger>
              <TabsTrigger
                value='received'
                className='text-sm'>
                Received
              </TabsTrigger>
              <TabsTrigger
                value='sent'
                className='text-sm'>
                Sent
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value='all'
              className='space-y-6'>
              <AllFriendsTab />
            </TabsContent>

            <TabsContent
              value='online'
              className='space-y-6'>
              {allFriends.length > 0 ? (
                <></>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia>
                      <UsersIcon className='size-10 text-muted-foreground' />
                    </EmptyMedia>
                    <EmptyTitle>No Friends Found</EmptyTitle>
                    <EmptyDescription>
                      You don&apos;t have any friends yet. Start adding friends to stay
                      connected.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </TabsContent>

            <TabsContent
              value='received'
              className='space-y-6'>
              <FriendRequestTab />
            </TabsContent>

            <TabsContent
              value='sent'
              className='space-y-6'>
              <FriendSentTab />
            </TabsContent>
          </Tabs>

          {/* Sidebar - User Suggestions */}
          <aside className='hidden lg:block'>
            <UserSuggestionsPanel />
          </aside>
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default FriendsPage;
