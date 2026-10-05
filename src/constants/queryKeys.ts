export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  LEAVE_TYPES: {
    ALL: ['leave-types'] as const,
  },
  BALANCES: {
    ALL: ['balances'] as const,
    ME: (year?: number) => ['balances', 'me', ...(year ? [year] : [])] as const,
  },
  LEAVE_REQUESTS: {
    ALL: ['leave-requests'] as const,
    LIST: (params?: object) => ['leave-requests', 'list', ...(params ? [params] : [])] as const,
    DETAIL: (id: string) => ['leave-requests', 'detail', id] as const,
    HISTORY: (id: string, page?: number) =>
      ['leave-requests', 'history', id, ...(page ? [page] : [])] as const,
  },
} as const
