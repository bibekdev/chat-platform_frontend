'use client';

import { UserPlusIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSendFriendRequest } from '@/features/friends/hooks';
import { getUserInitials } from '@/lib/utils';
import { UserSuggestion } from '../types';

interface UserSuggestionCardProps {
  user: UserSuggestion;
}

export const UserSuggestionCard = ({ user }: UserSuggestionCardProps) => {
  const { mutate: sendFriendRequest, isPending } = useSendFriendRequest();

  const handleAddFriend = () => {
    sendFriendRequest({ receiverId: user.id });
  };

  return (
    <div className='flex items-center gap-3 p-3 rounded-lg bg-muted '>
      <Avatar className='size-10 bg-primary/50'>
        <AvatarImage
          src={user.avatar}
          alt={user.name}
        />
        <AvatarFallback className='text-xs font-medium'>
          {getUserInitials(user.name)}
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium truncate'>{user.name}</p>
        <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
      </div>

      <Button
        variant='outline'
        size='icon'
        onClick={handleAddFriend}
        disabled={isPending}
        className='shrink-0'>
        <UserPlusIcon className='size-4' />
      </Button>
    </div>
  );
};
