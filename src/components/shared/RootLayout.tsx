import { LayoutDashboardIcon, PaletteIcon } from 'lucide-react'
import { Outlet } from 'react-router'
import { AppShell, type NavItem } from './AppShell'

// Phase 8 replaces this list with the role-aware navigation.
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboardIcon, end: true },
  ...(import.meta.env.DEV
    ? [{ label: 'Design system', to: '/design-system', icon: PaletteIcon }]
    : []),
]

export function RootLayout() {
  return (
    <AppShell navItems={NAV_ITEMS}>
      <Outlet />
    </AppShell>
  )
}
