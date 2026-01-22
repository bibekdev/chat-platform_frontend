export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const
  },

  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    suggestions: () => [...queryKeys.user.all, 'suggestions'] as const
  },

  friends: {
    all: ['friends'] as const,
    incomingRequestsCount: () =>
      [...queryKeys.friends.all, 'incomingRequestsCount'] as const,
    incomingRequests: () => [...queryKeys.friends.all, 'incomingRequests'] as const,
    outgoingRequests: () => [...queryKeys.friends.all, 'outgoingRequests'] as const,
    friends: () => [...queryKeys.friends.all, 'friends'] as const
  },

  conversations: {
    all: ['conversations'] as const,
    list: () => [...queryKeys.conversations.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.conversations.all, 'detail', id] as const,
    members: (id: string) => [...queryKeys.conversations.all, 'members', id] as const
  }
};
