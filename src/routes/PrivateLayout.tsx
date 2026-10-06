import { Navigate, Outlet, useLocation } from 'react-router'
import { AppShell, PageLoader } from '@/components/shared'
import { LOGIN_PATH } from '@/constants/pathRoutes'
import { UserMenu } from '@/features/auth/components/UserMenu'
import { useAuth } from '@/hooks/useAuth'
import { buildNavItems } from '@/lib/navigation'

// Everything behind sign-in. While the session is being restored it shows a loader (no login
// flash), and when there is no session it sends the user to /login remembering where they were going.
export function PrivateLayout() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader label="Restoring your session" />
  if (!user) return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />

  return (
    <AppShell navItems={buildNavItems(user.role)} userMenu={<UserMenu user={user} />}>
      <Outlet />
    </AppShell>
  )
}
