import type { MonthlyDays, TeamDay } from '@/features/dashboard/types/dashboardTypes'
import { formatMonthShort, formatShortDay } from '@/lib/dates'

export interface MonthRow {
  month: string
  label: string
  days: number
  byType: { leaveTypeId: string; name: string; days: number }[]
}

// Twelve rows, January to December, so a month without leave still has its place on the axis.
export function toMonthRows(year: number, monthly: readonly MonthlyDays[]): MonthRow[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, '0')}`
    const byType = monthly
      .filter((row) => row.month === month)
      .map(({ leaveTypeId, name, days }) => ({ leaveTypeId, name, days }))
    const days = byType.reduce((sum, row) => sum + row.days, 0)
    return { month, label: formatMonthShort(month), days, byType }
  })
}

export interface TeamDayRow extends TeamDay {
  label: string
}

export function toTeamDayRows(days: readonly TeamDay[]): TeamDayRow[] {
  return days.map((day) => ({ ...day, label: formatShortDay(day.date) }))
}

export const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`
