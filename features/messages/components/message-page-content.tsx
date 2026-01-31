'use client';

import { MessageHeader } from './message-header';
import { MessageInput } from './message-input';
import { MessageList } from './message-list';

export const MessagePageContent = () => {
  return (
    <div className='flex-1 flex flex-col h-full'>
      <MessageHeader />
      <div className='flex-1 overflow-y-auto'>
        <MessageList />
      </div>
      <div className='border-t p-4'>
        <MessageInput />
      </div>
    </div>
  );
};
