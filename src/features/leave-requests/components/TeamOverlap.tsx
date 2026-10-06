import { UsersIcon } from 'lucide-react'
import { StatusBadge } from '@/components/shared'
import type { OverlapSummary } from '@/features/leave-requests/types/leaveRequestTypes'
import { formatDateRange } from '@/lib/dates'

const SHOWN_TEAMMATES = 5

// Who else on the team is off during a request. Shown to the person asking (the preview) and to the
// person deciding (the review), so both see the same picture.
export function TeamOverlap({
  overlaps,
  perspective = 'requester',
}: Readonly<{ overlaps: OverlapSummary; perspective?: 'requester' | 'approver' }>) {
  const { overlapping, peakConcurrent, teamSize } = overlaps
  // No manager means no team to compare with.
  if (teamSize === 0) return null
  const shown = overlapping.slice(0, SHOWN_TEAMMATES)
  const hidden = overlapping.length - shown.length

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground">
        <UsersIcon aria-hidden="true" className="size-4" />
        {perspective === 'approver' ? 'Their team' : 'Your team'}
      </p>
      {overlapping.length === 0 ? (
        <p>
          Nobody else on {perspective === 'approver' ? 'their' : 'your'} team is off in this period.
        </p>
      ) : (
        <>
          <p>
            {overlapping.length} {overlapping.length === 1 ? 'teammate is' : 'teammates are'} off in
            this period.
          </p>
          <ul className="flex flex-col gap-2">
            {shown.map((item) => (
              <li key={item.requestId} className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{item.name}</span>
                  <span className="text-body-sm text-muted-foreground">
                    {item.leaveType.name}, {formatDateRange(item.startDate, item.endDate)}
                  </span>
                </div>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
          {hidden > 0 && <p className="text-body-sm text-muted-foreground">and {hidden} more</p>}
        </>
      )}
      <p className="text-body-sm text-muted-foreground">
        At most {peakConcurrent} of {teamSize} {teamSize === 1 ? 'person' : 'people'} would be off
        on the same day, {perspective === 'approver' ? 'the requester' : 'you'} included.
      </p>
    </div>
  )
}
