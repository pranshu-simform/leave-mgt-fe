import { FileQuestionIcon, TriangleAlertIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { EmptyState, ErrorState, PageHeader } from '@/components/shared'
import { Alert, AlertAction, AlertDescription, AlertTitle, Button, Skeleton } from '@/components/ui'
import { PATH_ROUTES, requestDetailPath } from '@/constants/pathRoutes'
import { RequestForm } from '@/features/leave-requests/components/RequestForm'
import { useLeaveRequest } from '@/features/leave-requests/hooks/useLeaveRequest'
import { useUpdateRequest } from '@/features/leave-requests/hooks/useUpdateRequest'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import { useAuth } from '@/hooks/useAuth'
import { isApiError } from '@/lib/apiClient'
import { showError, showInfo } from '@/lib/toast'

// One id for both messages: when a save is refused because the request was decided, the server's
// message and the page's own redirect notice replace each other instead of stacking.
const EDIT_NOT_ALLOWED_TOAST = 'edit-not-allowed'

function LeaveToDetail({ id, message }: Readonly<{ id: string; message: string }>) {
  useEffect(() => showInfo(message, EDIT_NOT_ALLOWED_TOAST), [message])
  return <Navigate to={requestDetailPath(id)} replace />
}

// The form works from the request as it was when the form opened (the snapshot), not from the live
// query: the version sent with the edit must be the one the user saw, or a change made elsewhere
// would be overwritten without a warning.
function EditForm({
  request,
  onReload,
}: Readonly<{ request: LeaveRequest; onReload: () => Promise<void> }>) {
  const navigate = useNavigate()
  const [snapshot] = useState(request)
  const [conflict, setConflict] = useState(false)
  const update = useUpdateRequest(snapshot.id)
  const done = useCallback(
    () => void navigate(requestDetailPath(snapshot.id)),
    [navigate, snapshot.id],
  )

  return (
    <RequestForm
      mode="edit"
      defaultValues={{
        leaveTypeId: snapshot.leaveType.id,
        startDate: snapshot.startDate,
        endDate: snapshot.endDate,
        note: snapshot.note ?? '',
      }}
      lockedTypeName={snapshot.leaveType.name}
      cancelTo={requestDetailPath(snapshot.id)}
      notice={
        conflict && (
          <Alert variant="destructive" className="mb-6">
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>This request was changed elsewhere</AlertTitle>
            <AlertDescription>
              Reload to see the latest version, then make your change again.
            </AlertDescription>
            <AlertAction>
              <Button variant="outline" size="sm" onClick={() => void onReload()}>
                Reload
              </Button>
            </AlertAction>
          </Alert>
        )
      }
      onSubmit={(values) =>
        update.mutateAsync({
          startDate: values.startDate,
          endDate: values.endDate,
          note: values.note.trim() || undefined,
          version: snapshot.version,
        })
      }
      onDone={done}
      onSubmitError={(error) => {
        if (error.code === 'VERSION_CONFLICT') {
          setConflict(true)
          return true
        }
        if (error.code === 'REQUEST_LOCKED' || error.code === 'NOT_FOUND') {
          // Decided (or gone) in the meantime: say so and show the request as it is now.
          showError(error.message, EDIT_NOT_ALLOWED_TOAST)
          void navigate(requestDetailPath(snapshot.id))
          return true
        }
        return false
      }}
    />
  )
}

export default function EditRequestPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { data: request, isLoading, isError, error, refetch } = useLeaveRequest(id)
  // Remounting the form re-reads the request, which is how "Reload" resets it.
  const [reloads, setReloads] = useState(0)

  if (isError) {
    if (isApiError(error) && error.status === 404) {
      return (
        <EmptyState
          icon={FileQuestionIcon}
          title="Request not found"
          description="It may have been removed, or it is not yours to see."
          action={
            <Button render={<Link to={PATH_ROUTES.REQUESTS.PATH} />} nativeButton={false}>
              Back to my requests
            </Button>
          }
        />
      )
    }
    return <ErrorState message="We could not load this request." onRetry={() => void refetch()} />
  }

  if (isLoading || !request) {
    return (
      <div role="status" aria-busy="true" aria-label="Loading" className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (request.requester.id !== user?.id) {
    return (
      <LeaveToDetail id={request.id} message="Only the person who made a request can edit it." />
    )
  }
  if (request.status !== 'PENDING') {
    return (
      <LeaveToDetail
        id={request.id}
        message="This request has been decided, so it can no longer be edited."
      />
    )
  }

  return (
    <>
      <PageHeader
        title="Edit request"
        description="Change the dates or the note while the request is still pending."
        breadcrumbs={[
          { label: 'My requests', to: PATH_ROUTES.REQUESTS.PATH },
          { label: request.leaveType.name, to: requestDetailPath(request.id) },
          { label: 'Edit' },
        ]}
      />
      <EditForm
        key={reloads}
        request={request}
        onReload={async () => {
          await refetch()
          setReloads((count) => count + 1)
        }}
      />
    </>
  )
}
