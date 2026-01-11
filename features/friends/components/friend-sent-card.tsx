import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getUserInitials } from '@/lib/utils';
import { Friend } from '../types';

interface FriendRequestSentCardProps {
  requestId: string;
  receiver: Friend;
}

export const FriendRequestSentCard = ({
  requestId,
  receiver
}: FriendRequestSentCardProps) => {
  return (
    <Card>
      <CardContent className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Avatar className='size-15 bg-primary/50'>
            <AvatarImage src={receiver.avatar} />
            <AvatarFallback>{getUserInitials(receiver.name)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col gap-1'>
            <p className=' font-medium'>{receiver.name}</p>
            <p className='text-sm text-muted-foreground'>{receiver.email}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='destructive'>
            <XCircleIcon /> Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
