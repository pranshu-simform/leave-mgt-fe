import type { Holiday } from '@/features/calendar/types/calendarTypes'
import type { AbsenceItem } from '@/features/leave-requests/types/leaveRequestTypes'
import { daysOfMonth, isWeekend } from '@/lib/dates'

export interface AgendaDay {
  date: string
  holiday?: string
  people: AbsenceItem[]
}

// The phone view of a month: every working day that has someone away, and every public holiday.
// Weekends and holidays are not leave days (a request does not count them), so nobody is listed on
// them. ISO dates compare correctly as strings, so no Date objects are involved.
export function buildAgenda(
  items: readonly AbsenceItem[],
  month: string,
  holidays: readonly Holiday[],
): AgendaDay[] {
  const holidayByDate = new Map(holidays.map((holiday) => [holiday.date, holiday.name]))
  return daysOfMonth(month)
    .filter((date) => !isWeekend(date))
    .map((date) => {
      const holiday = holidayByDate.get(date)
      const people = holiday
        ? []
        : items
            .filter((item) => item.startDate <= date && item.endDate >= date)
            .sort((a, b) => a.name.localeCompare(b.name) || a.userId.localeCompare(b.userId))
      return { date, holiday, people }
    })
    .filter((day) => day.holiday !== undefined || day.people.length > 0)
}
