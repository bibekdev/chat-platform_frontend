'use client';

import { useMemo, useState } from 'react';
import {
  CheckIcon,
  CrownIcon,
  LogOutIcon,
  PencilIcon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UserMinusIcon,
  UserPlusIcon,
  XIcon
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { useAuthUser } from '@/features/auth/hooks';
import { useAllFriends } from '@/features/friends/hooks';
import { Friend } from '@/features/friends/types';
import { cn, getUserInitials } from '@/lib/utils';
import {
  useAddMembers,
  useDeleteConversation,
  useLeaveConversation,
  useRemoveMember,
  useUpdateConversation,
  useUpdateMemberRole
} from '../hooks';
import { ConversationMember, ConversationWithDetails, MemberRole } from '../types';
import { GroupAvatar } from './group-avatar';

interface ConversationSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: ConversationWithDetails;
}

export function ConversationSettings({
  open,
  onOpenChange,
  conversation
}: ConversationSettingsSheetProps) {
  const isGroup = conversation.type === 'group';

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto p-0'>
        <SheetHeader>
          <SheetTitle>Conversation Settings</SheetTitle>
          <SheetDescription>Manage your conversation</SheetDescription>
        </SheetHeader>

        {isGroup ? (
          <GroupSettings
            conversation={conversation}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <DirectSettings
            conversation={conversation}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function GroupSettings({
  conversation,
  onClose
}: {
  conversation: ConversationWithDetails;
  onClose: () => void;
}) {
  const { data: currentUser } = useAuthUser();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(conversation.name ?? '');
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: updateConversation, isPending: isUpdating } = useUpdateConversation(
    conversation.id
  );
  const { mutate: leaveConversation, isPending: isLeaving } = useLeaveConversation(
    conversation.id
  );
  const { mutate: deleteConversation, isPending: isDeleting } = useDeleteConversation(
    conversation.id
  );
  const { mutate: removeMember } = useRemoveMember(conversation.id);
  const { mutate: updateRole } = useUpdateMemberRole(conversation.id);

  const currentMember = conversation.members?.find(m => m.userId === currentUser?.id);
  const isOwner = currentMember?.role === 'owner';
  const isAdmin = currentMember?.role === 'admin';
  const canManage = isOwner || isAdmin;

  const memberAvatars = useMemo(
    () =>
      conversation.members
        ?.slice(0, 4)
        .map(m => ({ avatar: m.user.avatar, name: m.user.name })) ?? [],
    [conversation.members]
  );

  const handleSaveName = () => {
    if (!name.trim()) return;
    updateConversation({ name: name.trim() }, { onSuccess: () => setEditingName(false) });
  };

  const handleRemoveMember = (member: ConversationMember) => {
    removeMember(member.userId);
  };

  const handleToggleAdmin = (member: ConversationMember) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    updateRole({ memberId: member.userId, role: newRole });
  };

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col items-center gap-3 px-6 pt-10 pb-6'>
        <GroupAvatar
          avatars={memberAvatars}
          avatarUrl={conversation.avatarUrl}
          size={80}
        />
        {editingName ? (
          <div className='flex items-center gap-2 w-full max-w-60'>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className='h-8 text-center'
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  setEditingName(false);
                  setName(conversation.name ?? '');
                }
              }}
            />
            <Button
              size='icon-sm'
              variant='ghost'
              onClick={handleSaveName}
              disabled={isUpdating}>
              <CheckIcon className='size-4' />
            </Button>
            <Button
              size='icon-sm'
              variant='ghost'
              onClick={() => {
                setEditingName(false);
                setName(conversation.name ?? '');
              }}>
              <XIcon className='size-4' />
            </Button>
          </div>
        ) : (
          <div className='flex items-center gap-1.5'>
            <h2 className='text-lg font-semibold'>{conversation.name}</h2>
            {canManage && (
              <button
                onClick={() => setEditingName(true)}
                className='rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors'>
                <PencilIcon className='size-3.5' />
              </button>
            )}
          </div>
        )}
        {conversation.description && (
          <p className='text-sm text-muted-foreground text-center'>
            {conversation.description}
          </p>
        )}
        <p className='text-xs text-muted-foreground'>
          {conversation.members?.length ?? 0} members
        </p>
      </div>

      <div className='h-px bg-border' />

      {/* Members */}
      <div className='px-4 py-4'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-sm font-medium'>Members</h3>
          {canManage && (
            <Button
              variant='ghost'
              size='sm'
              className='h-7 text-xs'
              onClick={() => setAddMembersOpen(true)}>
              <UserPlusIcon className='size-3.5 mr-1' />
              Add
            </Button>
          )}
        </div>

        <div className='space-y-0.5'>
          {conversation.members?.map(member => (
            <MemberRow
              key={member.id}
              member={member}
              isCurrentUser={member.userId === currentUser?.id}
              canManage={canManage}
              isOwner={isOwner}
              onRemove={() => handleRemoveMember(member)}
              onToggleAdmin={() => handleToggleAdmin(member)}
            />
          ))}
        </div>
      </div>

      <div className='h-px bg-border' />

      {/* Actions */}
      <div className='px-4 py-4 space-y-1'>
        <Button
          variant='ghost'
          className='w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-9'
          onClick={() => setConfirmLeave(true)}>
          <LogOutIcon className='size-4 mr-2' />
          Leave group
        </Button>
        {isOwner && (
          <Button
            variant='ghost'
            className='w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-9'
            onClick={() => setConfirmDelete(true)}>
            <Trash2Icon className='size-4 mr-2' />
            Delete group
          </Button>
        )}
      </div>

      <AddMembersDialog
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
        conversationId={conversation.id}
        existingMemberIds={conversation.members?.map(m => m.userId) ?? []}
      />

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title='Leave group'
        description='Are you sure you want to leave this group? You will need to be re-invited to join again.'
        confirmLabel='Leave'
        onConfirm={() => {
          leaveConversation(undefined, {
            onSuccess: () => {
              setConfirmLeave(false);
              onClose();
            }
          });
        }}
        isPending={isLeaving}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title='Delete group'
        description='This will permanently delete this group and all its messages. This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={() => {
          deleteConversation(undefined, {
            onSuccess: () => {
              setConfirmDelete(false);
              onClose();
            }
          });
        }}
        isPending={isDeleting}
      />
    </div>
  );
}

function DirectSettings({
  conversation,
  onClose
}: {
  conversation: ConversationWithDetails;
  onClose: () => void;
}) {
  const { data: currentUser } = useAuthUser();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: deleteConversation, isPending } = useDeleteConversation(
    conversation.id
  );

  const otherMember = conversation.members?.find(m => m.userId !== currentUser?.id);

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col items-center gap-3 px-6 pt-10 pb-6'>
        <Avatar className='size-20 bg-primary/10'>
          <AvatarImage src={otherMember?.user.avatar} />
          <AvatarFallback className='text-xl'>
            {getUserInitials(otherMember?.user.name ?? '')}
          </AvatarFallback>
        </Avatar>
        <h2 className='text-lg font-semibold'>{otherMember?.user.name}</h2>
        <p className='text-sm text-muted-foreground'>{otherMember?.user.email}</p>
      </div>

      <div className='h-px bg-border' />

      <div className='px-4 py-4'>
        <Button
          variant='ghost'
          className='w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-9'
          onClick={() => setConfirmDelete(true)}>
          <Trash2Icon className='size-4 mr-2' />
          Delete conversation
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title='Delete conversation'
        description='This will permanently delete this conversation and all its messages. This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={() => {
          deleteConversation(undefined, {
            onSuccess: () => {
              setConfirmDelete(false);
              onClose();
            }
          });
        }}
        isPending={isPending}
      />
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  isPending: boolean;
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  isPending
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={'destructive'}
            onClick={onConfirm}
            disabled={isPending}>
            {isPending ? <Spinner className='size-4' /> : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MemberRow({
  member,
  isCurrentUser,
  canManage,
  isOwner,
  onRemove,
  onToggleAdmin
}: {
  member: ConversationMember;
  isCurrentUser: boolean;
  canManage: boolean;
  isOwner: boolean;
  onRemove: () => void;
  onToggleAdmin: () => void;
}) {
  return (
    <div className='flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary/50 transition-colors group'>
      <Avatar className='size-8'>
        <AvatarImage src={member.user.avatar} />
        <AvatarFallback className='text-xs'>
          {getUserInitials(member.user.name)}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-1.5'>
          <p className='text-sm font-medium truncate'>
            {member.user.name}
            {isCurrentUser && (
              <span className='text-muted-foreground font-normal'> (you)</span>
            )}
          </p>
          <RoleBadge role={member.role} />
        </div>
      </div>
      {canManage && !isCurrentUser && member.role !== 'owner' && (
        <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
          {isOwner && (
            <button
              onClick={onToggleAdmin}
              className='rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors'
              title={member.role === 'admin' ? 'Remove admin' : 'Make admin'}>
              <ShieldIcon className='size-3.5' />
            </button>
          )}
          <button
            onClick={onRemove}
            className='rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
            title='Remove member'>
            <UserMinusIcon className='size-3.5' />
          </button>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: MemberRole }) {
  if (role === 'member') return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
        role === 'owner' && 'bg-amber-500/10 text-amber-600',
        role === 'admin' && 'bg-blue-500/10 text-blue-600'
      )}>
      {role === 'owner' ? (
        <CrownIcon className='size-2.5' />
      ) : (
        <ShieldIcon className='size-2.5' />
      )}
      {role}
    </span>
  );
}

function AddMembersDialog({
  open,
  onOpenChange,
  conversationId,
  existingMemberIds
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  existingMemberIds: string[];
}) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data: friendships, isLoading } = useAllFriends();
  const { mutate: addMembers, isPending } = useAddMembers(conversationId);

  const existingSet = useMemo(() => new Set(existingMemberIds), [existingMemberIds]);

  const availableFriends = useMemo(() => {
    const friends =
      friendships?.map(f => f.friend).filter(f => !existingSet.has(f.id)) ?? [];
    if (!search.trim()) return friends;
    const q = search.toLowerCase();
    return friends.filter(
      f => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
    );
  }, [friendships, existingSet, search]);

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    if (selectedIds.size === 0) return;
    addMembers(
      { memberIds: Array.from(selectedIds) },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
          setSearch('');
          onOpenChange(false);
        }
      }
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedIds(new Set());
      setSearch('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>Add friends to this conversation.</DialogDescription>
        </DialogHeader>

        <div className='relative'>
          <SearchIcon className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search friends...'
            className='pl-8'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className='max-h-52 overflow-y-auto -mx-1 px-1'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Spinner className='size-5 text-primary' />
            </div>
          ) : availableFriends.length === 0 ? (
            <p className='py-8 text-center text-sm text-muted-foreground'>
              {search
                ? 'No friends match your search'
                : 'All your friends are already in this group'}
            </p>
          ) : (
            <div className='space-y-0.5'>
              {availableFriends.map((friend: Friend) => {
                const selected = selectedIds.has(friend.id);
                return (
                  <button
                    key={friend.id}
                    type='button'
                    onClick={() => toggle(friend.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary',
                      selected && 'bg-primary/5'
                    )}>
                    <Avatar className='size-8'>
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback className='text-xs'>
                        {getUserInitials(friend.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>{friend.name}</p>
                    </div>
                    <div
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      )}>
                      {selected && <CheckIcon className='size-3' />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || isPending}>
            {isPending ? <Spinner className='size-4' /> : `Add (${selectedIds.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
