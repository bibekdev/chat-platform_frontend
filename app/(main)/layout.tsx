import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Sidebar } from '@/components/sidebar/sidebar';
import { getUser } from '@/features/auth/server';
import { User } from '@/features/auth/types';
import { getIncomingFriendRequestsCount } from '@/features/friends/server';
import { getServerQueryClient } from '@/lib/queryClient-server';
import { queryKeys } from '@/lib/queryKeys';
import { SocketProvider } from '@/providers/socket-provider';

export const dynamic = 'force-dynamic';

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getUser
  });

  await queryClient.prefetchQuery({
    queryKey: queryKeys.friends.incomingRequestsCount(),
    queryFn: getIncomingFriendRequestsCount
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SocketProvider>
        <div className='flex h-screen overflow-hidden'>
          <div className='hidden md:block'>
            <Sidebar />
          </div>

          <main className='flex-1 flex flex-col min-w-0'>{children}</main>
        </div>
      </SocketProvider>
    </HydrationBoundary>
  );
};
export default MainLayout;
