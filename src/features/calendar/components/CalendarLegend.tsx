import { ClockIcon } from 'lucide-react'
import { barClasses } from '@/features/calendar/utils/leaveBarStyles'
import { swatchClass, typeSlot } from '@/lib/leaveTypeColors'
import { cn } from '@/lib/utils'

interface CalendarLegendProps {
  // The leave types that appear this month, as { id, name }.
  types: readonly { id: string; name: string }[]
  typeIds: readonly string[]
  // The today, weekend and holiday keys explain the grid's shading; the phone agenda has none.
  showGridKeys: boolean
}

export function CalendarLegend({ types, typeIds, showGridKeys }: Readonly<CalendarLegendProps>) {
  const first = types[0]
  return (
    <ul
      aria-label="Legend"
      className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3 text-body-sm"
    >
      {types.map((type) => (
        <li key={type.id} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn('size-3 rounded-sm', swatchClass(typeSlot(type.id, typeIds)))}
          />
          {type.name}
        </li>
      ))}
      {showGridKeys && first && (
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              'flex h-4 w-8 items-center px-1 rounded-sm',
              barClasses(typeSlot(first.id, typeIds), true),
            )}
          >
            <ClockIcon className="size-3" />
          </span>
          Pending approval
        </li>
      )}
      {showGridKeys && (
        <>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-full bg-primary" />
            Today
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3 rounded-sm border border-border bg-calendar-weekend"
            />
            Weekend
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3 rounded-sm border border-border bg-calendar-holiday"
            />
            Public holiday
          </li>
        </>
      )}
    </ul>
  )
}
