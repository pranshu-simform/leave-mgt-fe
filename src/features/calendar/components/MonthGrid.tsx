import { Card, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { LeaveBar } from '@/features/calendar/components/LeaveBar'
import { LoadRow } from '@/features/calendar/components/LoadRow'
import type { Holiday, SummaryDay } from '@/features/calendar/types/calendarTypes'
import { typeSlot } from '@/features/calendar/utils/leaveBarStyles'
import { buildRows } from '@/features/calendar/utils/monthGrid'
import type { AbsenceItem } from '@/features/leave-requests/types/leaveRequestTypes'
import { daysOfMonth, formatMonth, isWeekend, weekdayInitial, weekdayName } from '@/lib/dates'
import { cn } from '@/lib/utils'

interface MonthGridProps {
  month: string
  items: readonly AbsenceItem[]
  holidays: readonly Holiday[]
  // Every leave type code, so a type keeps its color whichever types are away this month.
  typeCodes: readonly string[]
  // People away per weekday (managers and HR); left out for employees.
  load?: readonly SummaryDay[]
  isBusy?: boolean
}

const DAY_WIDTH = 'w-9 min-w-9 max-w-9'

export function MonthGrid({
  month,
  items,
  holidays,
  typeCodes,
  load,
  isBusy = false,
}: Readonly<MonthGridProps>) {
  const days = daysOfMonth(month)
  const rows = buildRows(items, month, days.length)
  const holidayByDate = new Map(holidays.map((holiday) => [holiday.date, holiday.name]))
  const holidayDates = new Set(holidayByDate.keys())
  const shade = (date: string) =>
    holidayDates.has(date) ? 'bg-calendar-holiday' : isWeekend(date) ? 'bg-calendar-weekend' : ''

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="overflow-x-auto" aria-busy={isBusy}>
        <table
          className="table-fixed border-collapse text-body-sm"
          // Fixed layout needs a definite width: the name column plus one narrow column per day.
          style={{ width: `calc(11rem + ${days.length} * 2.25rem)` }}
        >
          <caption className="sr-only">
            Who is away in {formatMonth(month)}. One row per person, one column per day.
          </caption>
          <colgroup>
            <col className="w-44" />
            {days.map((date) => (
              <col key={date} className="w-9" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 w-44 min-w-44 bg-popover px-3 py-2 text-left text-label font-medium"
              >
                Person
              </th>
              {days.map((date) => {
                const holiday = holidayByDate.get(date)
                const header = (
                  <th
                    key={date}
                    scope="col"
                    aria-label={`${weekdayName(date)} ${Number(date.slice(8))}${holiday ? `, ${holiday}` : ''}`}
                    className={cn(
                      DAY_WIDTH,
                      'py-1 text-center text-caption font-normal text-muted-foreground',
                      shade(date),
                    )}
                  >
                    <span aria-hidden="true" className="block">
                      {weekdayInitial(date)}
                    </span>
                    <span aria-hidden="true" className="block tabular-nums text-foreground">
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
                  className="sticky left-0 z-10 w-44 min-w-44 max-w-44 truncate bg-popover px-3 py-1.5 text-left font-medium"
                >
                  {person.name}
                </th>
                {renderCells(person, days, shade, typeCodes)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function renderCells(
  person: ReturnType<typeof buildRows>[number],
  days: readonly string[],
  shade: (date: string) => string,
  typeCodes: readonly string[],
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
          <LeaveBar person={person} leave={leave} slot={typeSlot(leave.typeCode, typeCodes)} />
        </td>,
      )
      day = leave.endDay + 1
    } else {
      const date = days[day - 1] ?? ''
      cells.push(<td key={date} className={cn(DAY_WIDTH, shade(date))} />)
      day += 1
    }
  }
  return cells
}
