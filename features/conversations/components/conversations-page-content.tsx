'use client';

import { useRouter } from 'next/navigation';

import { Conversation } from '../types';
import { ConversationList } from './conversation-list';

export function ConversationsPageContent() {
  const router = useRouter();

  const handleConversationClick = (conversation: Conversation) => {
    router.push(`/conversations/${conversation.id}`);
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='border-b p-4'>
        <h1 className='text-2xl font-bold'>Messages</h1>
        <p className='text-sm text-muted-foreground'>Your conversations</p>
      </div>

      <div className='flex-1 overflow-y-auto p-4'>
        <ConversationList onConversationClick={handleConversationClick} />
      </div>
    </div>
  );
}
