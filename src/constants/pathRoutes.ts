import {
  CalendarDaysIcon,
  CalendarHeartIcon,
  CalendarRangeIcon,
  ClipboardCheckIcon,
  FileStackIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  PaletteIcon,
  ScaleIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react'
import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { USER_ROLES, type UserRole } from '@/constants/constant'

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
  CALENDAR: {
    PATH: '/calendar',
    ALLOWED_ROLES: [],
    COMPONENT: lazy(() => import('@/features/calendar/pages/CalendarPage')),
    NAV: { LABEL: 'Team calendar', ICON: CalendarRangeIcon },
  },
  NEW_REQUEST: {
    PATH: '/requests/new',
    ALLOWED_ROLES: [],
    COMPONENT: lazy(() => import('@/features/leave-requests/pages/NewRequestPage')),
  },
  REQUEST_DETAIL: {
    PATH: '/requests/:id',
    ALLOWED_ROLES: [],
    COMPONENT: lazy(() => import('@/features/leave-requests/pages/RequestDetailPage')),
  },
  APPROVALS: {
    PATH: '/approvals',
    ALLOWED_ROLES: [USER_ROLES.MANAGER, USER_ROLES.HR_ADMIN],
    COMPONENT: lazy(() => import('@/features/approvals/pages/ApprovalsPage')),
    NAV: { LABEL: 'Approvals', ICON: ClipboardCheckIcon },
  },
  // HR only: one page and one sidebar entry each.
  ADMIN_LEAVE_TYPES: {
    PATH: '/admin/leave-types',
    ALLOWED_ROLES: [USER_ROLES.HR_ADMIN],
    COMPONENT: lazy(() => import('@/features/admin/pages/LeaveTypesPage')),
    NAV: { LABEL: 'Leave types', ICON: ListChecksIcon },
  },
  ADMIN_HOLIDAYS: {
    PATH: '/admin/holidays',
    ALLOWED_ROLES: [USER_ROLES.HR_ADMIN],
    COMPONENT: lazy(() => import('@/features/admin/pages/HolidaysPage')),
    NAV: { LABEL: 'Holidays', ICON: CalendarHeartIcon },
  },
  ADMIN_USERS: {
    PATH: '/admin/users',
    ALLOWED_ROLES: [USER_ROLES.HR_ADMIN],
    COMPONENT: lazy(() => import('@/features/admin/pages/UsersPage')),
    NAV: { LABEL: 'Users', ICON: UsersIcon },
  },
  ADMIN_BALANCES: {
    PATH: '/admin/balances',
    ALLOWED_ROLES: [USER_ROLES.HR_ADMIN],
    COMPONENT: lazy(() => import('@/features/admin/pages/BalancesPage')),
    NAV: { LABEL: 'Balances', ICON: ScaleIcon },
  },
  ADMIN_REQUESTS: {
    PATH: '/admin/requests',
    ALLOWED_ROLES: [USER_ROLES.HR_ADMIN],
    COMPONENT: lazy(() => import('@/features/admin/pages/AdminRequestsPage')),
    // "All", so it is not mistaken for "My requests". Also the active entry on nothing else.
    NAV: { LABEL: 'All requests', ICON: FileStackIcon },
  },
  REQUEST_EDIT: {
    PATH: '/requests/:id/edit',
    ALLOWED_ROLES: [],
    COMPONENT: lazy(() => import('@/features/leave-requests/pages/EditRequestPage')),
  },
} satisfies Record<string, PathRoute>

export const LOGIN_PATH = '/login'
// Public, like sign-in: the link in the email a new user gets (`?token=`).
export const SET_PASSWORD_PATH = '/set-password'

// Path builders for the dynamic routes.
export const requestDetailPath = (id: string): string =>
  PATH_ROUTES.REQUEST_DETAIL.PATH.replace(':id', id)
export const requestEditPath = (id: string): string =>
  PATH_ROUTES.REQUEST_EDIT.PATH.replace(':id', id)
// The HR list of every request, optionally narrowed to one person.
export const adminRequestsPath = (userId?: string): string =>
  `${PATH_ROUTES.ADMIN_REQUESTS.PATH}${userId ? `?userId=${userId}` : ''}`

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
