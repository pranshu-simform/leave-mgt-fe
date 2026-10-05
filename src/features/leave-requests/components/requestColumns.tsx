import { Link } from 'react-router'
import { StatusBadge, type Column } from '@/components/shared'
import { requestDetailPath } from '@/constants/pathRoutes'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import { formatDateRange, formatInstantDate } from '@/lib/dates'

export const requestColumns: readonly Column<LeaveRequest>[] = [
  {
    id: 'type',
    header: 'Type',
    cell: (request) => (
      <Link to={requestDetailPath(request.id)} className="font-medium hover:underline">
        {request.leaveType.name}
      </Link>
    ),
  },
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
    cell: (request) => <StatusBadge status={request.status} />,
  },
  {
    id: 'submitted',
    header: 'Submitted',
    className: 'whitespace-nowrap text-muted-foreground',
    cell: (request) => formatInstantDate(request.createdAt),
  },
]
