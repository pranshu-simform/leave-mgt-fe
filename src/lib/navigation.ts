import type { NavItem } from '@/components/shared'
import type { UserRole } from '@/constants/constant'
import { DEV_ROUTES, PATH_ROUTES, type PathRoute } from '@/constants/pathRoutes'

function toNavItem({ PATH, NAV }: PathRoute): NavItem[] {
  return NAV ? [{ label: NAV.LABEL, to: PATH, icon: NAV.ICON, end: NAV.END }] : []
}

// The navigation is derived from the routes: a user sees exactly the entries they may open.
export function buildNavItems(role: UserRole): NavItem[] {
  const privateItems = Object.values<PathRoute>(PATH_ROUTES)
    .filter((route) => !route.ALLOWED_ROLES?.length || route.ALLOWED_ROLES.includes(role))
    .flatMap(toNavItem)
  const devItems = Object.values<PathRoute>(DEV_ROUTES).flatMap(toNavItem)
  return [...privateItems, ...devItems]
}

export function buildDevNavItems(): NavItem[] {
  return Object.values<PathRoute>(DEV_ROUTES).flatMap(toNavItem)
}
