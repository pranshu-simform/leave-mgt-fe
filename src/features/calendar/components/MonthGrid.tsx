import { useEffect, useRef } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { LeaveBar } from '@/features/calendar/components/LeaveBar'
import { LoadRow } from '@/features/calendar/components/LoadRow'
import type { Holiday, SummaryDay } from '@/features/calendar/types/calendarTypes'
import { typeSlot } from '@/lib/leaveTypeColors'
import { buildRows } from '@/features/calendar/utils/monthGrid'
import type { AbsenceItem } from '@/features/leave-requests/types/leaveRequestTypes'
import {
  daysOfMonth,
  formatMonth,
  isWeekend,
  todayLocalIso,
  weekdayInitial,
  weekdayName,
} from '@/lib/dates'
import { cn } from '@/lib/utils'

interface MonthGridProps {
  month: string
  items: readonly AbsenceItem[]
  holidays: readonly Holiday[]
  // Every leave type id, so a type keeps its color whichever types are away this month.
  typeIds: readonly string[]
  // People away per weekday (managers and HR); left out for employees.
  load?: readonly SummaryDay[]
  isBusy?: boolean
}

// Days share the width the name column leaves, but never get narrower than 1.875 rem (30 px): with the
// 9 rem name column a 31-day month fits the 1,120 px content area of a 1440 px screen, and on a
// narrower one the grid scrolls.
const DAY_MIN_REM = 1.875
// The sticky name column is narrower on a tablet (--name-col), so more days fit beside it. Its right
// edge is drawn as a pseudo-element, because a border on a sticky cell scrolls away in a collapsed
// table, and its fill is opaque (the card's is glass), so days that scroll under it do not show through.
const NAME_COLUMN =
  'w-(--name-col) min-w-(--name-col) max-w-(--name-col) after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border'

export function MonthGrid({
  month,
  items,
  holidays,
  typeIds,
  load,
  isBusy = false,
}: Readonly<MonthGridProps>) {
  const days = daysOfMonth(month)
  const rows = buildRows(items, month, days.length)
  const holidayByDate = new Map(holidays.map((holiday) => [holiday.date, holiday.name]))
  const holidayDates = new Set(holidayByDate.keys())
  // Today is the browser's date: it only decides what to highlight, never a rule.
  const today = todayLocalIso()
  const shade = (date: string) =>
    cn(
      holidayDates.has(date) ? 'bg-calendar-holiday' : isWeekend(date) && 'bg-calendar-weekend',
      date === today && 'bg-primary/5',
    )

  // When the month does not fit, bring today (or the first leave of another month) into view once,
  // instead of always opening on the 1st.
  const scrollRef = useRef<HTMLDivElement>(null)
  const firstDay = rows[0]?.leaves[0]?.startDay
  const focusDate = days.includes(today) ? today : firstDay ? days[firstDay - 1] : undefined
  useEffect(() => {
    const container = scrollRef.current
    if (!container || !focusDate || container.scrollWidth <= container.clientWidth) return
    const cell = container.querySelector<HTMLElement>(`[data-date="${focusDate}"]`)
    const nameWidth = container.querySelector<HTMLElement>('thead th')?.offsetWidth ?? 0
    if (cell) container.scrollLeft = cell.offsetLeft - nameWidth - cell.offsetWidth
  }, [month, focusDate])

  return (
    <div ref={scrollRef} className="overflow-x-auto" aria-busy={isBusy}>
      <table
        className="w-full table-fixed border-collapse text-body-sm [--name-col:8rem] xl:[--name-col:9rem]"
        // Fixed layout needs a definite minimum: the name column plus the narrowest day columns.
        style={{ minWidth: `calc(var(--name-col) + ${days.length} * ${DAY_MIN_REM}rem)` }}
      >
        <caption className="sr-only">
          Who is away in {formatMonth(month)}. One row per person, one column per day.
        </caption>
        <colgroup>
          <col className="w-(--name-col)" />
          {days.map((date) => (
            <col key={date} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th
              scope="col"
              className={cn(
                'sticky left-0 z-10 bg-background px-3 py-2 text-left text-label font-medium',
                NAME_COLUMN,
              )}
            >
              Person
            </th>
            {days.map((date) => {
              const holiday = holidayByDate.get(date)
              const isToday = date === today
              const header = (
                <th
                  key={date}
                  scope="col"
                  data-date={date}
                  aria-label={`${weekdayName(date)} ${Number(date.slice(8))}${isToday ? ', today' : ''}${holiday ? `, ${holiday}` : ''}`}
                  className={cn(
                    'py-1.5 text-center text-caption font-normal text-muted-foreground',
                    shade(date),
                  )}
                >
                  <span aria-hidden="true" className="block">
                    {weekdayInitial(date)}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mx-auto flex size-6 items-center justify-center rounded-full tabular-nums',
                      isToday
                        ? 'bg-primary font-semibold text-primary-foreground'
                        : 'text-foreground',
                    )}
                  >
                    {Number(date.slice(8))}
                  </span>
                </th>
              )
              return holiday ? (
                <Tooltip key={date}>
                  <TooltipTrigger render={header} />
                  <TooltipContent>{holiday}</TooltipContent>
                </Tooltip>
              ) : (
                header
              )
            })}
          </tr>
        </thead>
        <tbody>
          {load && <LoadRow days={days} holidayDates={holidayDates} load={load} />}
          {rows.map((person) => (
            <tr key={person.userId} className="border-t border-border">
              <th
                scope="row"
                title={person.name}
                className={cn(
                  'sticky left-0 z-10 truncate bg-background px-3 py-2 text-left font-medium',
                  NAME_COLUMN,
                )}
              >
                {person.name}
              </th>
              {renderCells(person, days, shade, typeIds)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderCells(
  person: ReturnType<typeof buildRows>[number],
  days: readonly string[],
  shade: (date: string) => string,
  typeIds: readonly string[],
) {
  const cells = []
  let day = 1
  while (day <= days.length) {
    const leave = person.leaves.find((span) => span.startDay === day)
    if (leave) {
      cells.push(
        <td
          key={`leave-${leave.requestId}`}
          colSpan={leave.endDay - leave.startDay + 1}
          className="p-0.5"
        >
          <LeaveBar person={person} leave={leave} slot={typeSlot(leave.typeId, typeIds)} />
        </td>,
      )
      day = leave.endDay + 1
    } else {
      const date = days[day - 1] ?? ''
      cells.push(<td key={date} className={shade(date)} />)
      day += 1
    }
  }
  return cells
}
