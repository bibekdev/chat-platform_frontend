export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me'
  },
  users: {
    profile: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    suggestions: '/users/suggestions'
  },

  friends: {
    getFriends: '/friends',
    removeFriend: (id: string) => `/friends/${id}`,
    sendFriendRequest: '/friends/requests',
    getIncomingFriendRequests: '/friends/requests/incoming',
    getIncomingRequestsCount: '/friends/requests/incoming/count',
    getOutgoingFriendRequests: '/friends/requests/outgoing',
    acceptFriendRequest: (id: string) => `/friends/requests/${id}/accept`,
    rejectFriendRequest: (id: string) => `/friends/requests/${id}/reject`,
    cancelFriendRequest: (id: string) => `/friends/requests/${id}/cancel`
  }
} as const;
