import { Link, useRouteError } from 'react-router'
import { Button } from '@/components/ui'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ErrorState } from './ErrorState'

// Chrome, Firefox and Safari word a failed lazy import differently. After a deploy the old chunk
// names are gone, so this is the usual way a user reaches this page.
const CHUNK_FAILURE = /dynamically imported module|importing a module script failed/i

// What a user sees when a screen throws while rendering or its code could not be loaded. It is shown
// inside the app shell, so the navigation still works. React Router already logs the error to the console.
export function RouteErrorPage() {
  const error = useRouteError()
  usePageTitle('Something went wrong')

  const isChunkFailure = error instanceof Error && CHUNK_FAILURE.test(error.message)

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 py-10">
      <ErrorState
        className="w-full"
        message={
          isChunkFailure
            ? 'This page could not be loaded, most likely because the app was updated. Reload to get the latest version.'
            : 'This page hit an unexpected problem. Reloading usually fixes it.'
        }
        onRetry={() => window.location.reload()}
      />
      <Button variant="ghost" render={<Link to="/" reloadDocument />} nativeButton={false}>
        Back home
      </Button>
    </div>
  )
}
