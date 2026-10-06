import { useEffect } from 'react'
import { APP_NAME } from '@/constants/constant'

// The browser tab and the screen reader announcement on navigation: "<page> · Leave & Attendance".
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`
  }, [title])
}
