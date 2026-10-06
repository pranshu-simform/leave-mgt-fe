import type { AbsenceItem } from '@/features/leave-requests/types/leaveRequestTypes'

// One leave, placed on a month's columns. Days are 1-based day-of-month numbers, already clipped to
// the month, so a leave that starts earlier or ends later is cut at the edge of the grid.
export interface LeaveSpan {
  requestId: string
  typeCode: string
  typeName: string
  status: AbsenceItem['status']
  startDay: number
  endDay: number
  startsBefore: boolean
  endsAfter: boolean
  // The real dates, for the label: the grid only shows the part inside the month.
  startDate: string
  endDate: string
}

export interface PersonRow {
  userId: string
  name: string
  leaves: LeaveSpan[]
}

const dayOf = (iso: string) => Number(iso.slice(8, 10))

// One row per person who is away, alphabetical; each person's leaves left to right. ISO dates of
// one month compare correctly as strings, so no Date objects are involved.
export function buildRows(
  items: readonly AbsenceItem[],
  month: string,
  dayCount: number,
): PersonRow[] {
  const first = `${month}-01`
  const last = `${month}-${String(dayCount).padStart(2, '0')}`
  const people = new Map<string, PersonRow>()

  for (const item of items) {
    // A defensive guard: the API only returns leave that touches the month.
    if (item.endDate < first || item.startDate > last) continue
    const row = people.get(item.userId) ?? { userId: item.userId, name: item.name, leaves: [] }
    row.leaves.push({
      requestId: item.requestId,
      typeCode: item.leaveType.code,
      typeName: item.leaveType.name,
      status: item.status,
      startDay: item.startDate < first ? 1 : dayOf(item.startDate),
      endDay: item.endDate > last ? dayCount : dayOf(item.endDate),
      startsBefore: item.startDate < first,
      endsAfter: item.endDate > last,
      startDate: item.startDate,
      endDate: item.endDate,
    })
    people.set(item.userId, row)
  }

  for (const row of people.values()) row.leaves.sort((a, b) => a.startDay - b.startDay)
  return [...people.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.userId.localeCompare(b.userId),
  )
}
