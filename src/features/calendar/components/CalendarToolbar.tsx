import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { AppSelect, type SelectOption } from '@/components/shared'
import { Button, Checkbox, Label } from '@/components/ui'
import { addMonths, currentMonthLocal, formatMonth } from '@/lib/dates'

interface CalendarToolbarProps {
  month: string
  onMonthChange: (month: string) => void
  includePending: boolean
  onIncludePendingChange: (value: boolean) => void
  // Only HR picks a team; everyone else sees their own.
  teamOptions?: readonly SelectOption[]
  team?: string
  onTeamChange?: (managerId: string) => void
}

// The top band of the calendar card: the month on the left, the filters on the right. It wraps on a
// narrow screen, the filters taking a row of their own.
export function CalendarToolbar({
  month,
  onMonthChange,
  includePending,
  onIncludePendingChange,
  teamOptions,
  team,
  onTeamChange,
}: Readonly<CalendarToolbarProps>) {
  const isCurrent = month === currentMonthLocal()
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border px-4 py-3">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous month"
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <h2 aria-live="polite" className="min-w-36 px-2 text-center text-h3 sm:min-w-40">
          {formatMonth(month)}
        </h2>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
      {!isCurrent && (
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(currentMonthLocal())}>
          Today
        </Button>
      )}
      <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 sm:ml-auto sm:w-auto">
        {teamOptions && onTeamChange && (
          <AppSelect
            aria-label="Team"
            className="w-full sm:w-60"
            options={teamOptions}
            value={team ?? ''}
            onValueChange={onTeamChange}
            placeholder="Choose a team"
          />
        )}
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={includePending}
            onCheckedChange={(checked) => onIncludePendingChange(checked === true)}
          />
          Show pending
        </Label>
      </div>
    </div>
  )
}
