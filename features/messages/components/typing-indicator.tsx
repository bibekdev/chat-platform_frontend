import { PublicUser } from '@/features/conversations/types';

interface TypingIndicatorProps {
  users: PublicUser[];
}

export const TypingIndicator = ({ users }: TypingIndicatorProps) => {
  return (
    <div className='h-6 px-4'>
      {users.length > 0 && (
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-200'>
          <span className='inline-flex gap-0.5'>
            <span className='size-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]' />
            <span className='size-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]' />
            <span className='size-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]' />
          </span>
          <span>
            {users.length === 1
              ? `${users[0].name} is typing`
              : users.length === 2
                ? `${users[0].name} and ${users[1].name} are typing`
                : `${users[0].name} and ${users.length - 1} others are typing`}
          </span>
        </div>
      )}
    </div>
  );
};
