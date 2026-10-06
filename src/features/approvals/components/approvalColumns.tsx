import { StatusBadge, type Column } from '@/components/shared'
import { Button } from '@/components/ui'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import { formatDateRange, formatInstantDate } from '@/lib/dates'

export function buildApprovalColumns(
  onReview: (id: string) => void,
): readonly Column<LeaveRequest>[] {
  return [
    {
      id: 'employee',
      header: 'Employee',
      className: 'font-medium',
      cell: (request) => request.requester.name,
    },
    { id: 'type', header: 'Type', cell: (request) => request.leaveType.name },
    {
      id: 'dates',
      header: 'Dates',
      className: 'whitespace-nowrap',
      cell: (request) => formatDateRange(request.startDate, request.endDate),
    },
    {
      id: 'days',
      header: 'Days',
      align: 'end',
      className: 'tabular-nums',
      cell: (request) => request.days,
    },
    {
      id: 'submitted',
      header: 'Submitted',
      className: 'whitespace-nowrap text-muted-foreground',
      cell: (request) => formatInstantDate(request.createdAt),
    },
    { id: 'status', header: 'Status', cell: (request) => <StatusBadge status={request.status} /> },
    {
      id: 'actions',
      header: 'Review',
      align: 'end',
      cell: (request) => (
        <Button
          variant="outline"
          size="sm"
          aria-label={`Review request from ${request.requester.name}`}
          onClick={() => onReview(request.id)}
        >
          Review
        </Button>
      ),
    },
  ]
}
