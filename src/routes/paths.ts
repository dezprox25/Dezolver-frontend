export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
} as const

export type AppPath = (typeof PATHS)[keyof typeof PATHS]
