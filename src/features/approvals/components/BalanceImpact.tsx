import { TriangleAlertIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useUserBalances } from '@/features/balances/hooks/useUserBalances'
import type { LeaveRequest } from '@/features/leave-requests/types/leaveRequestTypes'
import { isoYear } from '@/lib/dates'

// The employee's balance for this request's type and year, and what approving would leave. It is
// information for the decision: the server still refuses an approval that would overspend.
export function BalanceImpact({ request }: Readonly<{ request: LeaveRequest }>) {
  const year = isoYear(request.startDate)
  const { data, isLoading, isError } = useUserBalances(request.requester.id, year)

  if (isLoading) return <Skeleton className="h-5 w-2/3" />
  if (isError) {
    return <p className="text-muted-foreground">The balance could not be loaded.</p>
  }

  // No row means a type that draws no balance (unpaid leave) or a year with no allowance set up.
  const balance = data?.find((row) => row.leaveTypeId === request.leaveType.id)
  if (!balance) {
    return (
      <p className="text-muted-foreground">
        There is no {request.leaveType.name.toLowerCase()} balance for {year}.
      </p>
    )
  }

  const { remaining, allowance, used } = balance
  const afterApproval = remaining - request.days
  const isPending = request.status === 'PENDING'

  return (
    <div className="flex flex-col gap-1">
      <p>
        <span className="tabular-nums">{remaining}</span> of{' '}
        <span className="tabular-nums">{allowance}</span> days left in {year}
        {isPending && (
          <>
            , <span className="font-semibold tabular-nums">{afterApproval}</span> if you approve
          </>
        )}
        .
      </p>
      <p className="text-body-sm text-muted-foreground">{used} used so far.</p>
      {isPending && afterApproval < 0 && (
        <p className="flex items-start gap-1.5 text-body-sm text-danger-subtle-foreground">
          <TriangleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Only {remaining} {remaining === 1 ? 'day is' : 'days are'} left, so approving this request
          will be refused.
        </p>
      )}
    </div>
  )
}
