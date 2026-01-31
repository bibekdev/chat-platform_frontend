import { SendIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const MessageInput = () => {
  return (
    <div className='w-full flex items-center gap-2'>
      <Input
        className='h-10 focus-visible:ring-0 border-none focus-visible:ring-offset-0'
        placeholder='Type your message...'
      />
      <Button
        variant='default'
        size='icon'
        className='rounded-full size-10'>
        <SendIcon className='size-4' />
      </Button>
    </div>
  );
};
