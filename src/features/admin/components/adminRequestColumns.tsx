import { Link } from 'react-router'
import { StatusBadge, type Column } from '@/components/shared'
import { requestDetailPath } from '@/constants/pathRoutes'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import { formatDateRange, formatInstantDate } from '@/lib/dates'

export const adminRequestColumns: readonly Column<LeaveRequest>[] = [
  {
    id: 'employee',
    header: 'Employee',
    mobile: 'title',
    cell: (request) => (
      <Link
        to={requestDetailPath(request.id)}
        aria-label={`${request.requester.name}, ${request.leaveType.name}, ${formatDateRange(request.startDate, request.endDate)}`}
        className="font-medium hover:underline"
      >
        {request.requester.name}
      </Link>
    ),
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
    id: 'status',
    header: 'Status',
    mobile: 'status',
    cell: (request) => <StatusBadge status={request.status} />,
  },
  {
    id: 'submitted',
    header: 'Submitted',
    mobile: 'hidden',
    className: 'whitespace-nowrap text-muted-foreground',
    cell: (request) => formatInstantDate(request.createdAt),
  },
]
