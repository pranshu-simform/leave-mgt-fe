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
  // Dev only: Vite removes this branch (and the page's chunk) from the production build.
  ...(import.meta.env.DEV
    ? {
        DESIGN_SYSTEM: {
          PATH: '/design-system',
          COMPONENT: lazy(() => import('@/features/design-system/pages/DesignSystemPage')),
        },
      }
    : {}),
} satisfies Record<string, PathRoute>
