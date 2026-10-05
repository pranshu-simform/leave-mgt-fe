export const API_CONFIG = {
  BASE_URL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  API_CUSTOM_TIMEOUT: 60000,
} as const

export const PAGE_SIZE_OPTIONS = [25, 50, 75, 100] as const
export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0]

export const REACT_QUERY_CONFIG = {
  STALE_TIME_OPTIONS: {
    VERY_SHORT: 1000 * 30,
    SHORT: 2 * 60 * 1000,
    MEDIUM: 3 * 60 * 1000,
    LONG: 5 * 60 * 1000,
  },
  CACHE_TIME: 1000 * 60 * 10,
  GLOBAL_RETRY: 3,
  RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 30000,
} as const

export const USER_ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  HR_ADMIN: 'HR_ADMIN',
} as const
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  HR_ADMIN: 'HR admin',
}

export const AUTH_EVENTS = {
  // Dispatched on window when the session cannot be refreshed any more.
  FORCE_LOGOUT: 'auth:force-logout',
} as const

export const SESSION_REFRESH = {
  LOCK_NAME: 'session-refresh',
  LAST_REFRESH_KEY: 'session:last-refresh',
  // A refresh by another tab this recently already rotated the shared cookies.
  RECENT_WINDOW_MS: 10_000,
} as const
