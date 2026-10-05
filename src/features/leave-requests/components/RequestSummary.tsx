import { StatusBadge } from '@/components/shared'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import { formatDateRange, formatDateTime } from '@/lib/dates'

function Row({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="text-muted-foreground sm:w-32 sm:shrink-0">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}

export function RequestSummary({ request }: Readonly<{ request: LeaveRequest }>) {
  return (
    <dl className="flex flex-col gap-3">
      <Row label="Status">
        <StatusBadge status={request.status} />
      </Row>
      <Row label="Leave type">{request.leaveType.name}</Row>
      <Row label="Dates">{formatDateRange(request.startDate, request.endDate)}</Row>
      <Row label="Working days">
        <span className="tabular-nums">{request.days}</span>
      </Row>
      <Row label="Note">{request.note ?? <span className="text-muted-foreground">None</span>}</Row>
      <Row label="Requested by">{request.requester.name}</Row>
      <Row label="Submitted">{formatDateTime(request.createdAt)}</Row>
      {request.decidedAt && <Row label="Decided">{formatDateTime(request.decidedAt)}</Row>}
    </dl>
  )
}
