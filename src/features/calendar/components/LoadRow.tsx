import type { SummaryDay } from '@/features/calendar/types/calendarTypes'
import { formatDate, isWeekend } from '@/lib/dates'
import { cn } from '@/lib/utils'

const LEVELS = [
  'text-muted-foreground',
  'bg-info-subtle text-info-subtle-foreground',
  'bg-warning-subtle text-warning-subtle-foreground',
  'bg-danger-subtle text-danger-subtle-foreground',
] as const

// How crowded a day is, from none to most of the team. The number is always printed, so the
// intensity is a hint and not the only signal.
function level(away: number, teamSize: number): (typeof LEVELS)[number] {
  if (away === 0 || teamSize === 0) return LEVELS[0]
  const share = away / teamSize
  if (share < 1 / 3) return LEVELS[1]
  if (share < 2 / 3) return LEVELS[2]
  return LEVELS[3]
}

interface LoadRowProps {
  days: readonly string[]
  holidayDates: ReadonlySet<string>
  load: readonly SummaryDay[]
}

// A row of the grid for managers and HR: people away per weekday, over the size of the team.
export function LoadRow({ days, holidayDates, load }: Readonly<LoadRowProps>) {
  const byDate = new Map(load.map((day) => [day.date, day]))
  const teamSize = load[0]?.teamSize

  return (
    <tr>
      <th
        scope="row"
        className="sticky left-0 z-10 bg-popover px-3 py-1 text-left text-label font-medium"
      >
        Away{teamSize ? ` of ${teamSize}` : ''}
      </th>
      {days.map((date) => {
        if (isWeekend(date) || holidayDates.has(date)) return <td key={date} aria-hidden="true" />
        const day = byDate.get(date)
        const away = day ? day.pending + day.approved : 0
        return (
          <td key={date} className="p-0.5 text-center">
            <span
              title={`${formatDate(date)}: ${away}${day ? ` of ${day.teamSize}` : ''} away`}
              className={cn(
                'block rounded-sm py-0.5 text-caption tabular-nums',
                level(away, day?.teamSize ?? teamSize ?? 0),
              )}
            >
              {away}
            </span>
          </td>
        )
      })}
    </tr>
  )
}
