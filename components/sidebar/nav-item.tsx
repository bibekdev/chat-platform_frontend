import Link from 'next/link';

import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  badge?: number;
}

export const NavItem = ({ href, icon: Icon, label, isActive, badge }: NavItemProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            'relative flex items-center justify-center size-12 rounded-2xl transition-all',
            'hover:bg-primary/50 hover:rounded-xl',
            isActive ? 'bg-primary rounded-xl' : 'bg-secondary'
          )}>
          <Icon
            className={cn(
              'size-5',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}
          />
          {badge !== undefined && badge > 0 && (
            <span className='absolute -top-1 -right-1 size-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold'>
              {badge}
            </span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent
        side='right'
        sideOffset={4}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
};
