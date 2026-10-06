import { ClockIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import type { PersonRow, LeaveSpan } from '@/features/calendar/utils/monthGrid'
import { barClasses } from '@/features/calendar/utils/leaveBarStyles'
import { formatDateRange } from '@/lib/dates'
import { cn } from '@/lib/utils'

interface LeaveBarProps {
  person: PersonRow
  leave: LeaveSpan
  slot: number
}

// One leave across its days. It is focusable and carries the full sentence, so the bar is readable
// by keyboard and screen reader and does not depend on its color or hatching.
export function LeaveBar({ person, leave, slot }: Readonly<LeaveBarProps>) {
  const pending = leave.status === 'PENDING'
  const when = formatDateRange(leave.startDate, leave.endDate)
  const status = pending ? 'pending approval' : 'approved'
  const clipped =
    leave.startsBefore && leave.endsAfter
      ? ', continues on both sides of this month'
      : leave.startsBefore
        ? ', started before this month'
        : leave.endsAfter
          ? ', continues after this month'
          : ''
  const label = `${person.name}, ${leave.typeName}, ${when}, ${status}${clipped}`

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            role="img"
            aria-label={label}
            tabIndex={0}
            className={cn(
              'flex h-6 items-center gap-1 overflow-hidden px-1.5 text-caption font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/60',
              barClasses(slot, pending),
              leave.startsBefore ? 'rounded-l-none' : 'rounded-l-md',
              leave.endsAfter ? 'rounded-r-none' : 'rounded-r-md',
            )}
          />
        }
      >
        {pending && <ClockIcon aria-hidden="true" className="size-3 shrink-0" />}
        <span aria-hidden="true" className="truncate">
          {leave.typeName}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
