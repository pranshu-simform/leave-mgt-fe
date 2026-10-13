import { ClockIcon, PartyPopperIcon } from 'lucide-react'
import { Badge } from '@/components/ui'
import { TONE_CLASSES } from '@/components/shared'
import type { Holiday, SummaryDay } from '@/features/calendar/types/calendarTypes'
import { buildAgenda } from '@/features/calendar/utils/agenda'
import { loadLevel } from '@/features/calendar/utils/loadLevel'
import type { AbsenceItem } from '@/features/leave-requests/types/leaveRequestTypes'
import { formatDateRange, formatMonth, formatWeekdayDate, todayLocalIso } from '@/lib/dates'
import { swatchClass, typeSlot } from '@/lib/leaveTypeColors'
import { cn } from '@/lib/utils'

interface AgendaListProps {
  month: string
  items: readonly AbsenceItem[]
  holidays: readonly Holiday[]
  typeIds: readonly string[]
  // People away per weekday (managers and HR); left out for employees.
  load?: readonly SummaryDay[]
}

// The calendar on a phone: a month grid needs about 1,100 px, so under 768 px the same data is a list
// of days, each with the people away. Nothing scrolls sideways.
export function AgendaList({ month, items, holidays, typeIds, load }: Readonly<AgendaListProps>) {
  const days = buildAgenda(items, month, holidays)
  const loadByDate = new Map(load?.map((day) => [day.date, day]))
  const teamSize = load?.[0]?.teamSize
  const today = todayLocalIso()

  if (days.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-muted-foreground">
        Nobody is away on a working day in {formatMonth(month)}.
      </p>
    )
  }

  return (
    <ol aria-label={`Who is away in ${formatMonth(month)}`} className="divide-y divide-border">
      {days.map((day) => {
        const isToday = day.date === today
        const summary = loadByDate.get(day.date)
        const away = summary ? summary.approved + summary.pending : day.people.length
        const size = summary?.teamSize ?? teamSize
        return (
          <li
            key={day.date}
            className={cn('flex flex-col gap-2 px-4 py-3', isToday && 'bg-primary/5')}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-label font-semibold">
                {formatWeekdayDate(day.date)}
                {isToday && <Badge>Today</Badge>}
              </h3>
              {!day.holiday && (
                <span
                  className={cn(
                    'shrink-0 rounded-md px-1.5 py-0.5 text-caption tabular-nums',
                    load ? loadLevel(away, size ?? 0) : 'text-muted-foreground',
                  )}
                >
                  {size ? `${away} of ${size} away` : `${away} away`}
                </span>
              )}
            </div>
            {day.holiday ? (
              <p className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <PartyPopperIcon aria-hidden="true" className="size-4 shrink-0" />
                Public holiday: {day.holiday}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {day.people.map((person) => (
                  <li key={person.requestId} className="flex items-stretch gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'w-1 shrink-0 rounded-full',
                        swatchClass(typeSlot(person.leaveType.id, typeIds)),
                      )}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{person.name}</span>
                      <span className="text-body-sm text-muted-foreground">
                        {person.leaveType.name} ·{' '}
                        {formatDateRange(person.startDate, person.endDate)}
                      </span>
                    </div>
                    {person.status === 'PENDING' && (
                      <span
                        className={cn(
                          'flex shrink-0 items-center gap-1 self-center rounded-md border px-1.5 py-0.5 text-caption',
                          TONE_CLASSES.warning,
                        )}
                      >
                        <ClockIcon aria-hidden="true" className="size-3" />
                        Pending
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ol>
  )
}
