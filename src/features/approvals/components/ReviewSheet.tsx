import { ExternalLinkIcon, FileQuestionIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { EmptyState, ErrorState } from '@/components/shared'
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Skeleton,
} from '@/components/ui'
import { requestDetailPath } from '@/constants/pathRoutes'
import { BalanceImpact } from '@/features/approvals/components/BalanceImpact'
import { RejectDialog } from '@/features/approvals/components/RejectDialog'
import { useApproveRequest } from '@/features/approvals/hooks/useApproveRequest'
import { useRequestOverlaps } from '@/features/approvals/hooks/useRequestOverlaps'
import { AuditTimeline } from '@/features/leave-requests/components/AuditTimeline'
import { RequestSummary } from '@/features/leave-requests/components/RequestSummary'
import { TeamOverlap } from '@/features/leave-requests/components/TeamOverlap'
import { useLeaveRequest } from '@/features/leave-requests/hooks/useLeaveRequest'
import { useAuth } from '@/hooks/useAuth'
import { handleApiError, isApiError } from '@/lib/apiClient'
import { formatDateRange } from '@/lib/dates'
import { showError } from '@/lib/toast'

function SectionTitle({ children }: Readonly<{ children: string }>) {
  return <h3 className="text-label text-muted-foreground">{children}</h3>
}

function Overlaps({ id }: Readonly<{ id: string }>) {
  const { data, isLoading, isError } = useRequestOverlaps(id, true)
  if (isLoading) return <Skeleton className="h-16 w-full" />
  if (isError) return <p className="text-muted-foreground">The team could not be loaded.</p>
  // No manager means no team to compare with, so the block says nothing.
  return data && data.teamSize > 0 ? <TeamOverlap overlaps={data} perspective="approver" /> : null
}

function ReviewContent({ id, onClose }: Readonly<{ id: string; onClose: () => void }>) {
  const { user } = useAuth()
  const { data: request, isLoading, isError, error, refetch } = useLeaveRequest(id)
  const approve = useApproveRequest(id)
  const [rejecting, setRejecting] = useState(false)
  // A second click can arrive before the pending state has re-rendered, so the first one locks.
  const locked = useRef(false)

  if (isError) {
    // The API answers 404 for a request that does not exist and for one outside the user's scope.
    if (isApiError(error) && error.status === 404) {
      return (
        <div className="p-4">
          <EmptyState
            icon={FileQuestionIcon}
            title="Request not found"
            description="It may have been removed, or it is not one you can decide."
          />
        </div>
      )
    }
    return (
      <div className="p-4">
        <ErrorState message="We could not load this request." onRetry={() => void refetch()} />
      </div>
    )
  }

  if (isLoading || !request) {
    return (
      <div role="status" aria-busy="true" aria-label="Loading" className="flex flex-col gap-4 p-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  // Nobody decides their own request: the controls never appear, and the API refuses it anyway.
  const isOwn = request.requester.id === user?.id
  const canDecide = request.status === 'PENDING' && !isOwn

  const handleApprove = () => {
    if (locked.current) return
    locked.current = true
    approve.mutate(undefined, {
      onSuccess: onClose,
      onError: (err) => {
        // Already decided or not enough balance: the sheet stays and refreshes to the real state.
        showError(handleApiError(err, 'Could not approve the request'), 'decision-failed')
        if (isApiError(err) && err.status === 404) onClose()
      },
      onSettled: () => {
        locked.current = false
      },
    })
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{request.requester.name}</SheetTitle>
        <SheetDescription>
          {request.leaveType.name}, {formatDateRange(request.startDate, request.endDate)}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
        <RequestSummary request={request} />
        {!isOwn && (
          <>
            <section className="flex flex-col gap-2">
              <SectionTitle>Balance</SectionTitle>
              <BalanceImpact request={request} />
            </section>
            <section className="flex flex-col gap-2">
              <SectionTitle>Team</SectionTitle>
              <Overlaps id={request.id} />
            </section>
          </>
        )}
        <section className="flex flex-col gap-3">
          <SectionTitle>History</SectionTitle>
          <AuditTimeline requestId={request.id} />
        </section>
      </div>
      <SheetFooter className="border-t border-border">
        {canDecide && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleApprove} disabled={approve.isPending}>
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => setRejecting(true)}
              disabled={approve.isPending}
            >
              Reject
            </Button>
          </div>
        )}
        <Button
          variant="ghost"
          render={<Link to={requestDetailPath(request.id)} />}
          nativeButton={false}
        >
          <ExternalLinkIcon aria-hidden="true" data-icon="inline-start" />
          Open full request
        </Button>
      </SheetFooter>
      <RejectDialog
        open={rejecting}
        onOpenChange={setRejecting}
        requestId={request.id}
        employeeName={request.requester.name}
        onRejected={onClose}
        onGone={onClose}
      />
    </>
  )
}

interface ReviewSheetProps {
  // The request being reviewed, or null when the sheet is closed.
  requestId: string | null
  onClose: () => void
}

export function ReviewSheet({ requestId, onClose }: Readonly<ReviewSheetProps>) {
  return (
    <Sheet open={requestId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        {requestId && <ReviewContent key={requestId} id={requestId} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  )
}
