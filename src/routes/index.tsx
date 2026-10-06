import { Suspense } from 'react'
import type { RouteObject } from 'react-router'
import { PageNotFound, RootLayout } from '@/components/shared'
import { PATH_ROUTES, type PathRoute } from '@/constants/pathRoutes'

function buildRoute({ PATH, IS_INDEX, COMPONENT: Component }: PathRoute): RouteObject {
  const element = (
    <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
      <Component />
    </Suspense>
  )
  return IS_INDEX ? { index: true, element } : { path: PATH, element }
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      ...Object.values<PathRoute>(PATH_ROUTES).map(buildRoute),
      { path: '*', element: <PageNotFound /> },
    ],
  },
]
