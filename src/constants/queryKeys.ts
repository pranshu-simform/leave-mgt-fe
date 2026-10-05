export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  HEALTH: {
    READY: ['health', 'ready'] as const,
  },
} as const
