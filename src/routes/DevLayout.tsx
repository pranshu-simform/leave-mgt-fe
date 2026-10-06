import { Outlet } from 'react-router'
import { AppShell } from '@/components/shared'
import { buildDevNavItems } from '@/lib/navigation'

// The shell for dev-only pages, which need no sign-in.
export function DevLayout() {
  return (
    <AppShell navItems={buildDevNavItems()}>
      <Outlet />
    </AppShell>
  )
}
