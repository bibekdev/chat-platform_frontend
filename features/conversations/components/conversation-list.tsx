'use client';

import { MessageSquare } from 'lucide-react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useConversations } from '../hooks';
import { Conversation } from '../types';
import { ConversationCard } from './conversation-card';

interface ConversationListProps {
  onConversationClick?: (conversation: Conversation) => void;
}

export function ConversationList({ onConversationClick }: ConversationListProps) {
  const { data, isLoading, loadMoreRef, isFetchingNextPage, error } = useConversations();

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex flex-col items-center gap-3'>
          <Spinner className='size-8 text-primary' />
          <p className='text-sm text-muted-foreground'>Loading conversations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <MessageSquare className='size-10 text-destructive' />
          </EmptyMedia>
          <EmptyTitle>Failed to load conversations</EmptyTitle>
          <EmptyDescription>{error.message || 'Something went wrong'}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <MessageSquare className='size-10 text-muted-foreground' />
          </EmptyMedia>
          <EmptyTitle>No Conversations</EmptyTitle>
          <EmptyDescription>
            You don&apos;t have any conversations yet. Start a new conversation with your
            friends.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className='space-y-2'>
      {data.map(conversation => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          onClick={onConversationClick}
        />
      ))}

      {/* Sentinel element for infinite scroll */}
      <div
        ref={loadMoreRef}
        className='h-1'
      />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className='flex justify-center py-4'>
          <Spinner className='size-5 text-primary' />
        </div>
      )}
    </div>
  );
}
