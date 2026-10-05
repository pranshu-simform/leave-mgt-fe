import {
  BanIcon,
  CircleCheckIcon,
  CircleXIcon,
  PencilLineIcon,
  SendIcon,
  SparklesIcon,
  type LucideIcon,
} from 'lucide-react'
import { ErrorState, TableSkeleton } from '@/components/shared'
import { Button } from '@/components/ui'
import { useRequestHistory } from '@/features/leave-requests/hooks/useRequestHistory'
import type { EventAction, RequestEvent } from '@/features/leave-requests/types/leaveRequestTypes'
import { formatDateRange, formatDateTime, isValidIsoDate } from '@/lib/dates'

const ACTION_CONFIG: Record<EventAction, { label: string; icon: LucideIcon }> = {
  SUBMITTED: { label: 'Submitted', icon: SendIcon },
  AUTO_APPROVED: { label: 'Approved automatically', icon: SparklesIcon },
  APPROVED: { label: 'Approved', icon: CircleCheckIcon },
  REJECTED: { label: 'Rejected', icon: CircleXIcon },
  EDITED: { label: 'Edited', icon: PencilLineIcon },
  CANCELLED: { label: 'Cancelled', icon: BanIcon },
}

interface EditSnapshot {
  startDate: string
  endDate: string
  days: number
  note: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toSnapshot(value: unknown): EditSnapshot | null {
  if (
    !isRecord(value) ||
    typeof value.startDate !== 'string' ||
    typeof value.endDate !== 'string' ||
    !isValidIsoDate(value.startDate) ||
    !isValidIsoDate(value.endDate) ||
    typeof value.days !== 'number'
  ) {
    return null
  }
  return {
    startDate: value.startDate,
    endDate: value.endDate,
    days: value.days,
    note: typeof value.note === 'string' ? value.note : null,
  }
}

// An edit event stores what the request looked like before and after.
function editChange(metadata: unknown): { from: EditSnapshot; to: EditSnapshot } | null {
  if (!isRecord(metadata)) return null
  const from = toSnapshot(metadata.from)
  const to = toSnapshot(metadata.to)
  return from && to ? { from, to } : null
}

function describe(snapshot: EditSnapshot): string {
  return `${formatDateRange(snapshot.startDate, snapshot.endDate)} (${snapshot.days} ${snapshot.days === 1 ? 'day' : 'days'})`
}

function EventDetails({ event }: Readonly<{ event: RequestEvent }>) {
  const change = event.action === 'EDITED' ? editChange(event.metadata) : null
  return (
    <>
      {event.reason && <p className="text-body-sm">Reason: {event.reason}</p>}
      {change && (
        <dl className="text-body-sm text-muted-foreground">
          <div className="flex flex-wrap gap-x-1.5">
            <dt>Dates:</dt>
            <dd>
              {describe(change.from)} to {describe(change.to)}
            </dd>
          </div>
          {change.from.note !== change.to.note && (
            <div className="flex flex-wrap gap-x-1.5">
              <dt>Note:</dt>
              <dd>
                {change.from.note ?? 'none'} to {change.to.note ?? 'none'}
              </dd>
            </div>
          )}
        </dl>
      )}
    </>
  )
}

export function AuditTimeline({ requestId }: Readonly<{ requestId: string }>) {
  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useRequestHistory(requestId)

  if (isLoading) return <TableSkeleton rows={3} columns={1} />
  if (isError) {
    return <ErrorState message="We could not load the history." onRetry={refetch} />
  }

  const events = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-4">
        {events.map((event) => {
          const { label, icon: Icon } = ACTION_CONFIG[event.action]
          return (
            <li key={event.id} className="flex gap-3">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-accent-foreground">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="font-medium">
                  {label}{' '}
                  <span className="font-normal text-muted-foreground">by {event.actor.name}</span>
                </p>
                <time dateTime={event.createdAt} className="text-caption text-muted-foreground">
                  {formatDateTime(event.createdAt)}
                </time>
                <EventDetails event={event} />
              </div>
            </li>
          )
        })}
      </ol>
      {hasNextPage && (
        <Button
          variant="outline"
          className="self-start"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </Button>
      )}
    </div>
  )
}
