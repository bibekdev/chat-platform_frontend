'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { CheckIcon, SearchIcon, UsersIcon, XIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAllFriends } from '@/features/friends/hooks';
import { Friend } from '@/features/friends/types';
import { cn, getUserInitials } from '@/lib/utils';
import { useCreateConversationMutation } from '../hooks';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGroupDialog = ({ open, onOpenChange }: CreateGroupDialogProps) => {
  const [name, setName] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selectedFriends, setSelectedFrieds] = React.useState<Map<string, Friend>>(
    new Map()
  );

  const router = useRouter();

  const { data: friendships, isLoading } = useAllFriends();
  const { mutate: createConversation, isPending } = useCreateConversationMutation();

  const friends = React.useMemo(
    () => friendships?.map(f => f.friend) ?? [],
    [friendships]
  );

  const filteredFriends = React.useMemo(() => {
    if (!search.trim()) return friends;
    const q = search.toLowerCase();
    return friends.filter(
      f => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
    );
  }, [friends, search]);

  const toggleFriend = (friend: Friend) => {
    setSelectedFrieds(prev => {
      const next = new Map(prev);
      if (next.has(friend.id)) {
        next.delete(friend.id);
      } else {
        next.set(friend.id, friend);
      }
      return next;
    });
  };

  const removeFriend = (id: string) => {
    setSelectedFrieds(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const handleCreate = () => {
    if (!name.trim() || selectedFriends.size < 1) return;
    createConversation(
      {
        type: 'group',
        name: name.trim(),
        memberIds: Array.from(selectedFriends.keys())
      },
      {
        onSuccess: data => {
          setName('');
          setSearch('');
          setSelectedFrieds(new Map());
          onOpenChange(false);
          router.push(`/conversations/${data.id}`);
        }
      }
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('');
      setSearch('');
      setSelectedFrieds(new Map());
    }
    onOpenChange(nextOpen);
  };

  const selected = Array.from(selectedFriends.values());
  const canCreate = name.trim().length > 0 && selectedFriends.size >= 1;

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>New Group</DialogTitle>
          <DialogDescription>
            Create a group conversation with your friends.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Group name</label>
            <Input
              placeholder='Enter group name...'
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              Add members{' '}
              {selectedFriends.size > 0 && (
                <span className='ml-1.5 text-muted-foreground font-normal'>
                  ({selectedFriends.size} selected)
                </span>
              )}
            </label>

            {selected.length > 0 && (
              <div className='flex flex-wrap gap-1.5'>
                {selected.map(friend => (
                  <button
                    key={friend.id}
                    type='button'
                    onClick={() => removeFriend(friend.id)}
                    className='flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-1 pr-2 text-xs transition-colors hover:bg-primary/20'>
                    <Avatar className='size-5'>
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback className='text-[10px]'>
                        {getUserInitials(friend.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className='font-medium'>{friend.name.split(' ')[0]}</span>
                    <XIcon className='size-3 text-muted-foreground' />
                  </button>
                ))}
              </div>
            )}

            <div className='relative'>
              <SearchIcon className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search friends...'
                className='pl-8'
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className='max-h-52 overflow-y-auto -mx-1 px-1'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <Spinner className='size-5 text-primary' />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-muted-foreground'>
                <UsersIcon className='size-8 mb-2 opacity-50' />
                <p className='text-sm'>
                  {search ? 'No friends match your search' : 'No friends found'}
                </p>
              </div>
            ) : (
              <div className='space-y-0.5'>
                {filteredFriends.map(friend => {
                  const isSelected = selectedFriends.has(friend.id);

                  return (
                    <button
                      key={friend.id}
                      type='button'
                      onClick={() => toggleFriend(friend)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary',
                        isSelected && 'bg-primary/5'
                      )}>
                      <Avatar className='size-9'>
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{getUserInitials(friend.name)}</AvatarFallback>
                      </Avatar>

                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate'>{friend.name}</p>
                        <p className='text-xs text-muted-foreground truncate'>
                          {friend.email}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        )}>
                        {isSelected && <CheckIcon className='size-3' />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!canCreate || isPending}>
            {isPending ? <Spinner className='size-4' /> : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
