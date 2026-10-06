import { CalendarDaysIcon, LayoutDashboardIcon, PaletteIcon, type LucideIcon } from 'lucide-react'
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { UserRole } from '@/constants/constant'

export interface RouteNav {
  LABEL: string
  ICON: LucideIcon
  // Match only this exact path for the active state (the dashboard at "/").
  END?: boolean
}

export interface PathRoute {
  PATH: string
  IS_INDEX?: boolean
  COMPONENT: LazyExoticComponent<ComponentType>
  // Empty or omitted means any signed-in user.
  ALLOWED_ROLES?: readonly UserRole[]
  // Present means the route appears in the navigation for the roles allowed to open it.
  NAV?: RouteNav
}

// Private routes: they render inside PrivateLayout, so the user is signed in. Adding a screen is one
// entry here: the route, the role guard and the navigation all follow.
export const PATH_ROUTES = {
  DASHBOARD: {
    PATH: '/',
    IS_INDEX: true,
    ALLOWED_ROLES: [],
    COMPONENT: lazy(() => import('@/features/dashboard/pages/DashboardPage')),
    NAV: { LABEL: 'Dashboard', ICON: LayoutDashboardIcon, END: true },
  },
  REQUESTS: {
    PATH: '/requests',
    ALLOWED_ROLES: [],
    COMPONENT: lazy(() => import('@/features/leave-requests/pages/MyRequestsPage')),
    // Also the active entry on /requests/:id.
    NAV: { LABEL: 'My requests', ICON: CalendarDaysIcon },
  },
  REQUEST_DETAIL: {
    PATH: '/requests/:id',
    ALLOWED_ROLES: [],
    COMPONENT: lazy(() => import('@/features/leave-requests/pages/RequestDetailPage')),
  },
} satisfies Record<string, PathRoute>

export const LOGIN_PATH = '/login'

// Links to screens that have no entry above yet, and the path builders for dynamic routes.
export const NEW_REQUEST_PATH = '/requests/new'
export const requestDetailPath = (id: string): string =>
  PATH_ROUTES.REQUEST_DETAIL.PATH.replace(':id', id)

// Dev only: Vite removes this (and the page's chunk) from the production build. It needs no
// sign-in, so the style guide works without the API.
export const DEV_ROUTES: Record<string, PathRoute> = import.meta.env.DEV
  ? {
      DESIGN_SYSTEM: {
        PATH: '/design-system',
        COMPONENT: lazy(() => import('@/features/design-system/pages/DesignSystemPage')),
        NAV: { LABEL: 'Design system', ICON: PaletteIcon },
      },
    }
  : {}
