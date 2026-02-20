import Image from 'next/image';
import React from 'react';
import { Users } from 'lucide-react';

import { cn, getUserInitials } from '@/lib/utils';
import { MemberAvatar } from '../types';

interface GroupAvatarProps {
  avatars: MemberAvatar[];
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

export function GroupAvatar({
  avatars,
  avatarUrl,
  size = 48,
  className
}: GroupAvatarProps) {
  if (avatarUrl) {
    return (
      <div
        className={cn('relative shrink-0 overflow-hidden rounded-full', className)}
        style={{ width: size, height: size }}>
        <Image
          src={avatarUrl}
          alt='Group'
          fill
          unoptimized
          className='object-cover'
        />
      </div>
    );
  }

  const items = avatars.slice(0, 4);

  if (items.length === 0) {
    return (
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10',
          className
        )}
        style={{ width: size, height: size }}>
        <Users
          className='text-muted-foreground'
          style={{ width: size * 0.4, height: size * 0.4 }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full bg-primary/20',
        className
      )}
      style={{ width: size, height: size }}>
      {items.length === 1 && (
        <SingleLayout
          item={items[0]}
          size={size}
        />
      )}
      {items.length === 2 && (
        <TwoLayout
          items={items}
          size={size}
        />
      )}
      {items.length === 3 && (
        <ThreeLayout
          items={items}
          size={size}
        />
      )}
      {items.length >= 4 && (
        <FourLayout
          items={items}
          size={size}
        />
      )}
    </div>
  );
}

function AvatarCell({
  item,
  className,
  style
}: {
  item: MemberAvatar;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={style}>
      {item.avatar ? (
        <Image
          src={item.avatar}
          alt={item.name}
          fill
          unoptimized
          className='object-cover'
        />
      ) : (
        <div className='flex size-full items-center justify-center bg-muted text-[10px] font-medium text-muted-foreground'>
          {getUserInitials(item.name)}
        </div>
      )}
    </div>
  );
}

function SingleLayout({ item, size }: { item: MemberAvatar; size: number }) {
  return (
    <AvatarCell
      item={item}
      className='absolute inset-0'
    />
  );
}

function TwoLayout({ items, size }: { items: MemberAvatar[]; size: number }) {
  const half = size / 2;
  const gap = 1.5;
  return (
    <>
      <AvatarCell
        item={items[0]}
        className='absolute top-0 left-0 bottom-0'
        style={{ width: half - gap }}
      />
      <AvatarCell
        item={items[1]}
        className='absolute top-0 right-0 bottom-0'
        style={{ width: half - gap }}
      />
    </>
  );
}

function ThreeLayout({ items, size }: { items: MemberAvatar[]; size: number }) {
  const half = size / 2;
  const gap = 1.5;
  return (
    <>
      <AvatarCell
        item={items[0]}
        className='absolute top-0 left-0 bottom-0'
        style={{ width: half - gap }}
      />
      <AvatarCell
        item={items[1]}
        className='absolute top-0 right-0'
        style={{ width: half - gap, height: half - gap }}
      />
      <AvatarCell
        item={items[2]}
        className='absolute bottom-0 right-0'
        style={{ width: half - gap, height: half - gap }}
      />
    </>
  );
}

function FourLayout({ items, size }: { items: MemberAvatar[]; size: number }) {
  const half = size / 2;
  const gap = 1.5;
  return (
    <>
      <AvatarCell
        item={items[0]}
        className='absolute top-0 left-0'
        style={{ width: half - gap, height: half - gap }}
      />
      <AvatarCell
        item={items[1]}
        className='absolute top-0 right-0'
        style={{ width: half - gap, height: half - gap }}
      />
      <AvatarCell
        item={items[2]}
        className='absolute bottom-0 left-0'
        style={{ width: half - gap, height: half - gap }}
      />
      <AvatarCell
        item={items[3]}
        className='absolute bottom-0 right-0'
        style={{ width: half - gap, height: half - gap }}
      />
    </>
  );
}
