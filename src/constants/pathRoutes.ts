import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface PathRoute {
  PATH: string
  IS_INDEX?: boolean
  COMPONENT: LazyExoticComponent<ComponentType>
}

export const PATH_ROUTES = {
  DASHBOARD: {
    PATH: '/',
    IS_INDEX: true,
    COMPONENT: lazy(() => import('@/features/dashboard/pages/DashboardPage')),
  },
} satisfies Record<string, PathRoute>
