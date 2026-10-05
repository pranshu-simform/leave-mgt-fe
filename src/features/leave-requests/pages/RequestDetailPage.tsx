import { FileQuestionIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ConfirmDialog, EmptyState, ErrorState, PageHeader } from '@/components/shared'
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { PATH_ROUTES } from '@/constants/pathRoutes'
import { AuditTimeline } from '@/features/leave-requests/components/AuditTimeline'
import { RequestSummary } from '@/features/leave-requests/components/RequestSummary'
import { useCancelRequest } from '@/features/leave-requests/hooks/useCancelRequest'
import { useLeaveRequest } from '@/features/leave-requests/hooks/useLeaveRequest'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import { useAuth } from '@/hooks/useAuth'
import { isApiError } from '@/lib/apiClient'
import { formatDateRange, todayLocalIso } from '@/lib/dates'

const BREADCRUMBS = [{ label: 'My requests', to: PATH_ROUTES.REQUESTS.PATH }]

function CancelAction({ request }: Readonly<{ request: LeaveRequest }>) {
  const [open, setOpen] = useState(false)
  const cancel = useCancelRequest(request.id)
  // A fast second click can arrive before the pending state has re-rendered the button as disabled,
  // so the first click takes this lock synchronously. The server would answer the second with a 409.
  const submitting = useRef(false)

  const confirm = () => {
    if (submitting.current) return
    submitting.current = true
    cancel.mutate(undefined, {
      onSettled: () => {
        submitting.current = false
        setOpen(false)
      },
    })
  }
  const isApproved = request.status === 'APPROVED'

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Cancel request
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Cancel this request?"
        description={`Your ${request.leaveType.name} request for ${formatDateRange(request.startDate, request.endDate)} will be ${
          isApproved ? 'cancelled. Any days it used are returned to your balance.' : 'withdrawn.'
        }`}
        confirmLabel="Cancel request"
        destructive
        isPending={cancel.isPending}
        onConfirm={confirm}
      />
    </>
  )
}

export default function RequestDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { data: request, isLoading, isError, error, refetch } = useLeaveRequest(id)

  if (isError) {
    // The API answers 404 for a request that does not exist and for one this user may not read.
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
    return <ErrorState message="We could not load this request." onRetry={refetch} />
  }

  if (isLoading || !request) {
    return (
      <div role="status" aria-busy="true" aria-label="Loading" className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const isOwner = request.requester.id === user?.id
  const isPending = request.status === 'PENDING'
  // An approved request can be cancelled until it starts. The server decides with its own date; the
  // local date only chooses what to offer, and the server's message is shown if they disagree.
  const hasStarted = request.startDate < todayLocalIso()
  const canCancel = isOwner && (isPending || (request.status === 'APPROVED' && !hasStarted))

  return (
    <>
      <PageHeader
        title={`${request.leaveType.name} request`}
        description={isOwner ? undefined : `Requested by ${request.requester.name}`}
        breadcrumbs={[...BREADCRUMBS, { label: request.leaveType.name }]}
        actions={canCancel ? <CancelAction request={request} /> : undefined}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <RequestSummary request={request} />
            {isOwner && request.status === 'APPROVED' && hasStarted && (
              <p className="text-body-sm text-muted-foreground">
                This leave has already started, so it can no longer be cancelled here. Ask your
                manager if something changed.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">History</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditTimeline requestId={request.id} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
