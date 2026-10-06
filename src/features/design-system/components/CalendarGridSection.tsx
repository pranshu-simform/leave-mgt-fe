import { CalendarLegend } from '@/features/calendar/components/CalendarLegend'
import { MonthGrid } from '@/features/calendar/components/MonthGrid'
import type { Holiday, SummaryDay } from '@/features/calendar/types/calendarTypes'
import type { AbsenceItem } from '@/features/leave-requests/types/leaveRequestTypes'
import { Section } from './Section'

const MONTH = '2026-10'
const TYPE_CODES = ['ANNUAL', 'PARENTAL', 'SICK', 'UNPAID']

const absence = (
  requestId: string,
  userId: string,
  name: string,
  code: string,
  typeName: string,
  startDate: string,
  endDate: string,
  status: AbsenceItem['status'],
): AbsenceItem => ({
  requestId,
  userId,
  name,
  leaveType: { code, name: typeName },
  startDate,
  endDate,
  status,
})

const ITEMS: AbsenceItem[] = [
  absence(
    '1',
    'a',
    'Alice Archer',
    'ANNUAL',
    'Annual leave',
    '2026-10-19',
    '2026-10-21',
    'APPROVED',
  ),
  absence('2', 'b', 'Bob Baker', 'ANNUAL', 'Annual leave', '2026-10-20', '2026-10-23', 'PENDING'),
  absence('3', 'c', 'Cara Chen', 'SICK', 'Sick leave', '2026-10-21', '2026-10-21', 'APPROVED'),
  absence(
    '4',
    'd',
    'Dan Diaz',
    'PARENTAL',
    'Parental leave',
    '2026-09-28',
    '2026-10-02',
    'APPROVED',
  ),
]
const HOLIDAYS: Holiday[] = [{ date: '2026-10-14', name: 'Company Foundation Day' }]
const LOAD: SummaryDay[] = [
  [1, 1],
  [2, 1],
  [19, 1],
  [20, 2],
  [21, 3],
  [22, 1],
  [23, 1],
].map(([day, away]) => ({
  date: `2026-10-${String(day).padStart(2, '0')}`,
  managerId: 'm',
  managerName: 'Morgan Miles',
  teamSize: 5,
  pending: 0,
  approved: away ?? 0,
}))

export function CalendarGridSection() {
  return (
    <Section
      id="calendar-grid"
      title="Team calendar grid"
      description="A real table: one row per person who is away, one column per day, leave as bars colored by type (cat-1 to cat-8), pending hatched with a clock, weekends and holidays shaded, and a load strip of people away per weekday. Bars are focusable and carry the full sentence."
    >
      <MonthGrid
        month={MONTH}
        items={ITEMS}
        holidays={HOLIDAYS}
        typeCodes={TYPE_CODES}
        load={LOAD}
      />
      <CalendarLegend
        types={[
          { code: 'ANNUAL', name: 'Annual leave' },
          { code: 'PARENTAL', name: 'Parental leave' },
          { code: 'SICK', name: 'Sick leave' },
        ]}
        typeCodes={TYPE_CODES}
      />
    </Section>
  )
}
