import { CalendarCheckIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { EmptyState, ErrorState, TableSkeleton } from '@/components/shared'
import { NEW_REQUEST_PATH, requestDetailPath } from '@/constants/pathRoutes'
import { useMyRequests } from '@/features/leave-requests/hooks/useMyRequests'
import { formatDateRange, todayLocalIso } from '@/lib/dates'

const UPCOMING_COUNT = 5

export function UpcomingLeave() {
  // Approved requests that have not ended yet, soonest first (the server orders them). The local
  // date only decides what to show here; it is not a rule check.
  const { data, isLoading, isError, refetch } = useMyRequests({
    page: 1,
    limit: UPCOMING_COUNT,
    status: 'APPROVED',
    from: todayLocalIso(),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Upcoming leave</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <TableSkeleton rows={3} columns={2} />}
        {isError && (
          <ErrorState message="We could not load your upcoming leave." onRetry={refetch} />
        )}
        {data && data.items.length === 0 && (
          <EmptyState
            icon={CalendarCheckIcon}
            title="No upcoming leave"
            description="Approved leave that has not ended yet shows up here."
            action={
              <Button render={<Link to={NEW_REQUEST_PATH} />} nativeButton={false}>
                Request leave
              </Button>
            }
          />
        )}
        {data && data.items.length > 0 && (
          <ul className="flex flex-col divide-y divide-border">
            {data.items.map((request) => (
              <li key={request.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 flex-col">
                  <Link
                    to={requestDetailPath(request.id)}
                    className="truncate font-medium hover:underline"
                  >
                    {request.leaveType.name}
                  </Link>
                  <span className="text-body-sm text-muted-foreground">
                    {formatDateRange(request.startDate, request.endDate)}
                  </span>
                </div>
                <span className="shrink-0 text-body-sm text-muted-foreground tabular-nums">
                  {request.days} {request.days === 1 ? 'day' : 'days'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
