export const API_V1 = '/v1'

export const API_ROUTES = {
  AUTH: {
    LOGIN: `${API_V1}/auth/login`,
    REFRESH: `${API_V1}/auth/refresh`,
    LOGOUT: `${API_V1}/auth/logout`,
    ME: `${API_V1}/auth/me`,
  },
  LEAVE_TYPES: {
    LIST: `${API_V1}/leave-types`,
  },
  BALANCES: {
    ME: `${API_V1}/balances/me`,
    USER: `${API_V1}/users/:id/balances`,
  },
  CALENDAR: {
    MONTH: `${API_V1}/calendar`,
    SUMMARY: `${API_V1}/calendar/summary`,
    TEAMS: `${API_V1}/calendar/teams`,
  },
  HOLIDAYS: {
    LIST: `${API_V1}/holidays`,
  },
  APPROVALS: {
    LIST: `${API_V1}/approvals`,
    OVERLAPS: `${API_V1}/approvals/:id/overlaps`,
    APPROVE: `${API_V1}/leave-requests/:id/approve`,
    REJECT: `${API_V1}/leave-requests/:id/reject`,
  },
  LEAVE_REQUESTS: {
    LIST: `${API_V1}/leave-requests`,
    GET: `${API_V1}/leave-requests/:id`,
    PREVIEW: `${API_V1}/leave-requests/preview`,
    CREATE: `${API_V1}/leave-requests`,
    UPDATE: `${API_V1}/leave-requests/:id`,
    HISTORY: `${API_V1}/leave-requests/:id/history`,
    CANCEL: `${API_V1}/leave-requests/:id/cancel`,
  },
} as const
