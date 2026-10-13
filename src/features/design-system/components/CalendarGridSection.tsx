import { Card } from '@/components/ui'
import { AgendaList } from '@/features/calendar/components/AgendaList'
import { CalendarLegend } from '@/features/calendar/components/CalendarLegend'
import { MonthGrid } from '@/features/calendar/components/MonthGrid'
import type { Holiday, SummaryDay } from '@/features/calendar/types/calendarTypes'
import type { AbsenceItem } from '@/features/leave-requests/types/leaveRequestTypes'
import { Section, Subsection } from './Section'

const MONTH = '2026-10'
// Ids sort in this order, which fixes each type's color.
const TYPE_IDS = ['type-1', 'type-2', 'type-3', 'type-4']
const TYPE_ID_BY_NAME: Record<string, string> = {
  'Annual leave': 'type-1',
  'Parental leave': 'type-2',
  'Sick leave': 'type-3',
  'Unpaid leave': 'type-4',
}

const absence = (
  requestId: string,
  userId: string,
  name: string,
  typeName: string,
  startDate: string,
  endDate: string,
  status: AbsenceItem['status'],
): AbsenceItem => ({
  requestId,
  userId,
  name,
  leaveType: { id: TYPE_ID_BY_NAME[typeName] ?? 'type-1', name: typeName },
  startDate,
  endDate,
  status,
})

const ITEMS: AbsenceItem[] = [
  absence('1', 'a', 'Alice Archer', 'Annual leave', '2026-10-19', '2026-10-21', 'APPROVED'),
  absence('2', 'b', 'Bob Baker', 'Annual leave', '2026-10-20', '2026-10-23', 'PENDING'),
  absence('3', 'c', 'Cara Chen', 'Sick leave', '2026-10-21', '2026-10-21', 'APPROVED'),
  absence('4', 'd', 'Dan Diaz', 'Parental leave', '2026-09-28', '2026-10-02', 'APPROVED'),
]
const TYPES = [
  { id: 'type-1', name: 'Annual leave' },
  { id: 'type-2', name: 'Parental leave' },
  { id: 'type-3', name: 'Sick leave' },
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
      description="A real table: one row per person who is away, one column per day, leave as bars colored by type (cat-1 to cat-8), pending hatched with a clock, weekends and holidays shaded, and a load strip of people away per weekday. Bars are focusable and carry the full sentence. On a phone the same data is an agenda of days."
    >
      <Subsection title="Grid (768 px and up): fills the card, today circled, the name column stays put while days scroll">
        <Card className="gap-0 overflow-hidden py-0">
          <MonthGrid
            month={MONTH}
            items={ITEMS}
            holidays={HOLIDAYS}
            typeIds={TYPE_IDS}
            load={LOAD}
          />
          <CalendarLegend types={TYPES} typeIds={TYPE_IDS} showGridKeys />
        </Card>
      </Subsection>
      <Subsection title="Agenda (under 768 px): working days with someone away, and holidays">
        <Card className="max-w-sm gap-0 overflow-hidden py-0">
          <AgendaList
            month={MONTH}
            items={ITEMS}
            holidays={HOLIDAYS}
            typeIds={TYPE_IDS}
            load={LOAD}
          />
          <CalendarLegend types={TYPES} typeIds={TYPE_IDS} showGridKeys={false} />
        </Card>
      </Subsection>
    </Section>
  )
}
