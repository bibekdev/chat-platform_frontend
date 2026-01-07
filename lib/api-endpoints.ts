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
    update: (id: string) => `/users/${id}`
  }
} as const;
