export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
    SET_PASSWORD_LINK: (token: string) => ['auth', 'set-password-link', token] as const,
  },
  LEAVE_TYPES: {
    ALL: ['leave-types'] as const,
  },
  BALANCES: {
    ALL: ['balances'] as const,
    ME: (year?: number) => ['balances', 'me', ...(year ? [year] : [])] as const,
    USER: (userId: string, year: number) => ['balances', 'user', userId, year] as const,
  },
  DASHBOARD: {
    ALL: ['dashboard'] as const,
    STATS: (year?: number) => ['dashboard', 'stats', ...(year ? [year] : [])] as const,
  },
  CALENDAR: {
    ALL: ['calendar'] as const,
    MONTH: (params: object) => ['calendar', 'month', params] as const,
    SUMMARY: (params: object) => ['calendar', 'summary', params] as const,
    TEAMS: ['calendar', 'teams'] as const,
  },
  HOLIDAYS: {
    ALL: ['holidays'] as const,
    MONTH: (month: string) => ['holidays', month] as const,
  },
  ADMIN: {
    LEAVE_TYPES: ['admin', 'leave-types'] as const,
    HOLIDAYS: {
      ALL: ['admin', 'holidays'] as const,
      LIST: (params: object) => ['admin', 'holidays', params] as const,
    },
    // Everything the balance screens read, so one invalidation covers the reconcile check too.
    BALANCES: {
      ALL: ['admin', 'balances'] as const,
      RECONCILE: (year: number) => ['admin', 'balances', 'reconcile', year] as const,
    },
    USERS: {
      ALL: ['admin', 'users'] as const,
      LIST: (params: object) => ['admin', 'users', params] as const,
    },
    REQUESTS: {
      ALL: ['admin', 'requests'] as const,
      LIST: (params: object) => ['admin', 'requests', params] as const,
    },
  },
  APPROVALS: {
    ALL: ['approvals'] as const,
    LIST: (params?: object) => ['approvals', 'list', ...(params ? [params] : [])] as const,
    OVERLAPS: (id: string) => ['approvals', 'overlaps', id] as const,
  },
  LEAVE_REQUESTS: {
    ALL: ['leave-requests'] as const,
    LIST: (params?: object) => ['leave-requests', 'list', ...(params ? [params] : [])] as const,
    DETAIL: (id: string) => ['leave-requests', 'detail', id] as const,
    PREVIEW: (params: object) => ['leave-requests', 'preview', params] as const,
    HISTORY: (id: string, page?: number) =>
      ['leave-requests', 'history', id, ...(page ? [page] : [])] as const,
  },
} as const
