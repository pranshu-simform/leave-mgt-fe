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
