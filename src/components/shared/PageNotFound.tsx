import { CompassIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui'
import { usePageTitle } from '@/hooks/usePageTitle'
import { EmptyState } from './EmptyState'

export function PageNotFound() {
  usePageTitle('Page not found')
  return (
    <EmptyState
      icon={CompassIcon}
      title="Page not found"
      description="That address does not match a page here. It may have moved, or the link may be mistyped."
      action={
        <Button render={<Link to="/" />} nativeButton={false}>
          Back home
        </Button>
      }
    />
  )
}
