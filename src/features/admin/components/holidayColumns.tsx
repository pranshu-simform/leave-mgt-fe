import { Trash2Icon } from 'lucide-react'
import type { Column } from '@/components/shared'
import { Button } from '@/components/ui'
import type { AdminHoliday } from '@/features/admin/types/adminTypes'
import { formatWeekdayDate } from '@/lib/dates'

export function buildHolidayColumns(
  onDelete: (holiday: AdminHoliday) => void,
): readonly Column<AdminHoliday>[] {
  return [
    {
      id: 'date',
      header: 'Date',
      mobile: 'title',
      className: 'whitespace-nowrap font-medium',
      cell: (holiday) => formatWeekdayDate(holiday.date),
    },
    { id: 'name', header: 'Holiday', cell: (holiday) => holiday.name },
    {
      id: 'actions',
      header: 'Delete',
      mobile: 'action',
      align: 'end',
      cell: (holiday) => (
        <Button
          variant="outline"
          size="sm"
          aria-label={`Delete ${holiday.name}`}
          onClick={() => onDelete(holiday)}
        >
          <Trash2Icon aria-hidden="true" />
          Delete
        </Button>
      ),
    },
  ]
}
