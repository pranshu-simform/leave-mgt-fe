import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Button render={<Link to="/" />} nativeButton={false}>
        Back home
      </Button>
    </div>
  )
}
