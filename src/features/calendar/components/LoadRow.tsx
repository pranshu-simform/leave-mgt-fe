import type { SummaryDay } from '@/features/calendar/types/calendarTypes'
import { loadLevel } from '@/features/calendar/utils/loadLevel'
import { formatDate, isWeekend } from '@/lib/dates'
import { cn } from '@/lib/utils'

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
        className="sticky left-0 z-10 bg-background px-3 py-1.5 text-left text-label font-medium after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border"
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
                loadLevel(away, day?.teamSize ?? teamSize ?? 0),
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
