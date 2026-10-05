import { lazy, Suspense, type ReactNode } from 'react'
import type { RouteObject } from 'react-router'
import { PageLoader, PageNotFound, RoleRoute } from '@/components/shared'
import { DEV_ROUTES, LOGIN_PATH, PATH_ROUTES, type PathRoute } from '@/constants/pathRoutes'
import { DevLayout } from '@/routes/DevLayout'
import { PrivateLayout } from '@/routes/PrivateLayout'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

function buildRoute({
  PATH,
  IS_INDEX,
  COMPONENT: Component,
  ALLOWED_ROLES,
}: PathRoute): RouteObject {
  const element = withSuspense(
    <RoleRoute allowedRoles={ALLOWED_ROLES}>
      <Component />
    </RoleRoute>,
  )
  return IS_INDEX ? { index: true, element } : { path: PATH, element }
}

export const routes: RouteObject[] = [
  { path: LOGIN_PATH, element: withSuspense(<LoginPage />) },
  ...(import.meta.env.DEV
    ? [
        {
          element: <DevLayout />,
          children: Object.values<PathRoute>(DEV_ROUTES).map(({ PATH, COMPONENT: Component }) => ({
            path: PATH,
            element: withSuspense(<Component />),
          })),
        },
      ]
    : []),
  {
    path: '/',
    element: <PrivateLayout />,
    children: [
      ...Object.values<PathRoute>(PATH_ROUTES).map(buildRoute),
      { path: '*', element: <PageNotFound /> },
    ],
  },
]
