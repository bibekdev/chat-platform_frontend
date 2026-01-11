'use client';

import { SparklesIcon, UsersIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserSuggestions } from '../hooks';
import { UserSuggestionCard } from './user-suggestion-card';

export const UserSuggestionsPanel = () => {
  const { data: suggestions } = useUserSuggestions();

  return (
    <Card className='sticky top-8 border-dashed'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <SparklesIcon className='size-4 text-amber-500' />
          People you may know
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-1'>
        {suggestions.length > 0 ? (
          suggestions.slice(0, 5).map(user => (
            <UserSuggestionCard
              key={user.id}
              user={user}
            />
          ))
        ) : (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <UsersIcon className='size-8 text-muted-foreground/50 mb-2' />
            <p className='text-sm text-muted-foreground'>No suggestions available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
