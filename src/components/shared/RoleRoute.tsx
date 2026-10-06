import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router'
import type { UserRole } from '@/constants/constant'
import { useAuth } from '@/hooks/useAuth'
import { showError } from '@/lib/toast'

function AccessDenied() {
  useEffect(() => {
    showError('You do not have access to that page.', 'access-denied')
  }, [])
  return <Navigate to="/" replace />
}

interface RoleRouteProps {
  allowedRoles?: readonly UserRole[]
  children: ReactNode
}

// A convenience, not security: the API refuses what the role may not do. This only avoids showing a
// screen that would be empty or failing. An empty list means any signed-in user.
export function RoleRoute({ allowedRoles, children }: Readonly<RoleRouteProps>) {
  const { user } = useAuth()
  if (allowedRoles?.length && (!user || !allowedRoles.includes(user.role))) return <AccessDenied />
  return children
}
