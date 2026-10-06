import { ClockIcon } from 'lucide-react'
import { barClasses, swatchClass, typeSlot } from '@/features/calendar/utils/leaveBarStyles'
import { cn } from '@/lib/utils'

interface CalendarLegendProps {
  // The leave types that appear this month, as { code, name }.
  types: readonly { code: string; name: string }[]
  typeCodes: readonly string[]
}

export function CalendarLegend({ types, typeCodes }: Readonly<CalendarLegendProps>) {
  const first = types[0]
  return (
    <ul
      aria-label="Legend"
      className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 text-body-sm"
    >
      {types.map((type) => (
        <li key={type.code} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn('size-3 rounded-sm', swatchClass(typeSlot(type.code, typeCodes)))}
          />
          {type.name}
        </li>
      ))}
      {first && (
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              'flex h-4 w-8 items-center px-1 rounded-sm',
              barClasses(typeSlot(first.code, typeCodes), true),
            )}
          >
            <ClockIcon className="size-3" />
          </span>
          Pending approval
        </li>
      )}
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
    </ul>
  )
}
