import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getUserInitials } from '@/lib/utils';
import { useAcceptFriendRequest } from '../hooks';
import { Friend } from '../types';

interface FriendRequestReceivedCardProps {
  requestId: string;
  sender: Friend;
}

export const FriendRequestReceivedCard = ({
  requestId,
  sender
}: FriendRequestReceivedCardProps) => {
  const { mutate: acceptFriendRequest, isPending: isAcceptingFriendRequest } =
    useAcceptFriendRequest();

  return (
    <Card>
      <CardContent className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Avatar className='size-15 bg-primary/50'>
            <AvatarImage src={sender.avatar} />
            <AvatarFallback>{getUserInitials(sender.name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col gap-1'>
            <p className=' font-medium'>{sender.name}</p>
            <p className='text-sm text-muted-foreground'>{sender.email}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='default'
            onClick={() => acceptFriendRequest(requestId)}
            disabled={isAcceptingFriendRequest}>
            <CheckCircleIcon /> Accept
          </Button>
          <Button variant='destructive'>
            <XCircleIcon /> Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
