export const API_V1 = '/v1'

export const API_ROUTES = {
  AUTH: {
    LOGIN: `${API_V1}/auth/login`,
    REFRESH: `${API_V1}/auth/refresh`,
    LOGOUT: `${API_V1}/auth/logout`,
    ME: `${API_V1}/auth/me`,
  },
  HEALTH: {
    LIVE: '/health',
    READY: '/health/ready',
  },
} as const
