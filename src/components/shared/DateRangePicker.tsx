import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatDateRange, isValidIsoDate, parseIsoDate, toIsoDate } from '@/lib/dates'
import { cn } from '@/lib/utils'

export interface DateRangeValue {
  // YYYY-MM-DD, or '' while nothing is chosen.
  start: string
  end: string
}

interface DateRangePickerProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  placeholder?: string
  disabled?: boolean
  // The wiring FormGroup hands to its control.
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

// Two clicks make a range: the first day, then the last. Clicking the same day twice is a
// single-day range. It disables no day by date: which dates are allowed depends on the leave type
// and the server's date, so the preview says it, not the calendar.
export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Choose dates',
  disabled,
  ...controlProps
}: Readonly<DateRangePickerProps>) {
  const [open, setOpen] = useState(false)
  // The first day of a range being chosen, until the second click.
  const [anchor, setAnchor] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const hasValue = isValidIsoDate(value.start) && isValidIsoDate(value.end)
  const label = hasValue ? formatDateRange(value.start, value.end) : placeholder

  const shown = anchor
    ? { from: parseIsoDate(anchor), to: undefined }
    : hasValue
      ? { from: parseIsoDate(value.start), to: parseIsoDate(value.end) }
      : undefined

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    setAnchor(null)
  }

  const handleDayClick = (day: Date) => {
    const clicked = toIsoDate(day)
    if (!anchor) {
      setAnchor(clicked)
      return
    }
    const [start, end] = anchor <= clicked ? [anchor, clicked] : [clicked, anchor]
    onChange({ start, end })
    handleOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn('w-full justify-start font-normal', !hasValue && 'text-muted-foreground')}
            {...controlProps}
          />
        }
      >
        <CalendarIcon aria-hidden="true" data-icon="inline-start" />
        {label}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={shown}
          onDayClick={handleDayClick}
          defaultMonth={hasValue ? parseIsoDate(value.start) : new Date()}
          numberOfMonths={isMobile ? 1 : 2}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  )
}
