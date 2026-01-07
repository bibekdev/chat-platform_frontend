import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getUser } from '@/features/auth/server';
import { User } from '@/features/auth/types';
import { getServerQueryClient } from '@/lib/queryClient-server';
import { queryKeys } from '@/lib/queryKeys';

export const dynamic = 'force-dynamic';

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getUser
  });

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
};
export default MainLayout;
