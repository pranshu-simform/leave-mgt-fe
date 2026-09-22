import { createBrowserRouter } from 'react-router'
import { HomePage } from '@/pages/home-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { RootLayout } from './root-layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
