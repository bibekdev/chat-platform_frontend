'use client';

import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LogOutIcon,
  MessageSquareIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react';

import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { useFriendRequestIncomingCount } from '@/features/friends/hooks/useFriendRequestIncomingCount';
import { getUserInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { TooltipProvider } from '../ui/tooltip';
import { NavItem } from './nav-item';

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: user } = useAuthUser();

  const { data: incomingFriendRequestsCount } = useFriendRequestIncomingCount();

  const navItems = [
    { href: '/conversations', label: 'Conversations', icon: MessageSquareIcon, badge: 1 },
    {
      href: '/friends',
      label: 'Friends',
      icon: UsersIcon,
      badge: incomingFriendRequestsCount
    }
  ];

  return (
    <div className='flex flex-col items-center w-18 py-3 border-r border-border max-h-screen h-full'>
      {/* LOGO */}
      <div className='mb-4'>
        <div className='size-12 bg-primary rounded-2xl flex items-center justify-center text-xl font-bold'>
          M
        </div>
      </div>

      {/* DIVIDER */}
      <div className='w-8 h-0.5 bg-muted rounded-full mb-4' />

      {/* NAVIGATION */}
      <TooltipProvider>
        <nav className='flex-1 flex flex-col gap-5'>
          {navItems.map(item => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </nav>
      </TooltipProvider>

      {/* User Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className=''>
          <Avatar className='size-12 bg-primary/60'>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className='text-lg font-bold bg-primary/60'>
              {getUserInitials(`${user?.name}`)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side='right'
          align='start'
          sideOffset={10}
          className='w-56'>
          {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
          <div className='flex p-2 gap-4'>
            <div className='flex items-center gap-2'>
              <Avatar className='size-10 bg-primary/60'>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className='text-lg font-bold bg-primary/60'>
                  {getUserInitials(`${user?.name}`)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className='flex flex-col'>
              <p className='font-medium'>{user?.name}</p>
              <p className='text-xs text-muted-foreground'>{user?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <UserIcon className='size-4' />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className='size-4' />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='hover:text-destructive-foreground! hover:bg-destructive/50!'>
            <LogOutIcon className='size-4' />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
