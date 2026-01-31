'use client';

import { useRouter } from 'next/navigation';

import { Conversation } from '../../types';
import { ConversationList } from './conversation-list';

export const ConversationSidebar = () => {
  const router = useRouter();

  const handleConversationClick = (conversation: Conversation) => {
    router.push(`/conversations/${conversation.id}`);
  };

  return (
    <div className='flex flex-col border-r w-[400px]'>
      <div className='border-b p-4'>
        <h1 className='text-2xl font-bold'>Conversations</h1>
        <p className='text-sm text-muted-foreground'>Your conversations</p>
      </div>

      <div className='flex-1 overflow-y-auto p-4'>
        <ConversationList onConversationClick={handleConversationClick} />
      </div>
    </div>
  );
};
