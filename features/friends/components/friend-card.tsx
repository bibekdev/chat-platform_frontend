'use client';

import { MessageCircle, UserMinus } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getUserInitials } from '@/lib/utils';
import { Friend } from '../types';

interface FriendCardProps {
  data: Friend;
}

export function FriendCard({ data }: FriendCardProps) {
  return (
    <Card className='flex-row items-center justify-between p-4 gap-4'>
      <div className='flex items-center gap-2'>
        <Avatar className='size-15 bg-primary/50'>
          <AvatarImage src={data.avatar} />
          <AvatarFallback>{getUserInitials(data.name)}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-1'>
          <p className=' font-medium'>{data.name}</p>
          <p className='text-sm text-muted-foreground'>{data.email}</p>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Button variant='outline'>
          <MessageCircle className='size-4' />
          Message
        </Button>
        <Button
          variant='destructive'
          className=''>
          <UserMinus className='size-4' />
          Remove
        </Button>
      </div>
    </Card>
  );
}
