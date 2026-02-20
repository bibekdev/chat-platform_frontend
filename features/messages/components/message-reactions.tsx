import { useEffect, useRef, useState } from 'react';

import { SmilePlusIcon } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MessageReactionGrouped } from '../types';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👎', '🎉'];

interface ReactionDisplayProps {
  reactions: MessageReactionGrouped[];
  isOwn: boolean;
  onToggleReaction: (reaction: string, hasReacted: boolean) => void;
}

export function ReactionDisplay({
  reactions,
  isOwn,
  onToggleReaction
}: ReactionDisplayProps) {
  if (!reactions.length) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap gap-1 mt-1',
        isOwn ? 'justify-end' : 'justify-start'
      )}>
      <TooltipProvider>
        {reactions.map((r, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onToggleReaction(r.reaction, r.hasReacted)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
                  'border hover:bg-accent',
                  r.hasReacted
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-border bg-background'
                )}>
                {r.reaction}
                <span className='text-muted-foreground'>{r.count}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side='top'>
              {r.users.map(u => u.name).join(', ')}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
}

export function ReactionPicker({ onSelect }: ReactionPickerProps) {
  return (
    <div className='flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-md animate-in fade-in-0 zoom-in-95 duration-100'>
      {QUICK_EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className='rounded-md p-1 text-base leading-none hover:bg-accent transition-colors'>
          {emoji}
        </button>
      ))}
    </div>
  );
}

interface ReactionButtonProps {
  onSelect: (emoji: string) => void;
  align?: 'start' | 'end';
  className?: string;
}

export function ReactionButton({ onSelect, align, className }: ReactionButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
              onClick={() => setOpen(prev => !prev)}>
              <SmilePlusIcon className='size-3.5' />
            </button>
          </TooltipTrigger>
          {!open && <TooltipContent side='top'>React</TooltipContent>}
        </Tooltip>
      </TooltipProvider>

      {open && (
        <div
          className={cn(
            'absolute bottom-full mb-1 z-50',
            align === 'end' ? 'right-0' : 'left-0'
          )}>
          <ReactionPicker onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}
