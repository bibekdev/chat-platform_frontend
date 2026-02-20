'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useConversationListSocket } from '../../hooks';
import { Conversation } from '../../types';
import { CreateGroupDialog } from '../create-group-dialog';
import { ConversationList } from './conversation-list';

export const ConversationSidebar = () => {
  const router = useRouter();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  useConversationListSocket();

  const handleConversationClick = (conversation: Conversation) => {
    router.push(`/conversations/${conversation.id}`);
  };

  return (
    <>
      <div className='flex flex-col border-r w-100'>
        <div className='border-b p-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Conversations</h1>
            <p className='text-sm text-muted-foreground'>Your conversations</p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={'outline'}
                  size='icon'
                  onClick={() => setCreateGroupOpen(true)}>
                  <Users className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New group</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className='flex-1 overflow-y-auto p-4'>
          <ConversationList onConversationClick={handleConversationClick} />
        </div>
      </div>
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
      />
    </>
  );
};
