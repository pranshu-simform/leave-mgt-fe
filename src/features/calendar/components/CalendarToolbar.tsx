import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { AppSelect, FormGroup, type SelectOption } from '@/components/shared'
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
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3 pb-4">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous month"
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <h2 aria-live="polite" className="min-w-40 px-2 text-center text-h3">
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
        {!isCurrent && (
          <Button variant="ghost" onClick={() => onMonthChange(currentMonthLocal())}>
            This month
          </Button>
        )}
      </div>
      {teamOptions && onTeamChange && (
        <div className="w-60">
          <FormGroup label="Team">
            {(controlProps) => (
              <AppSelect
                {...controlProps}
                options={teamOptions}
                value={team ?? ''}
                onValueChange={onTeamChange}
                placeholder="Choose a team"
              />
            )}
          </FormGroup>
        </div>
      )}
      <Label className="flex items-center gap-2 pb-1.5">
        <Checkbox
          checked={includePending}
          onCheckedChange={(checked) => onIncludePendingChange(checked === true)}
        />
        Show pending
      </Label>
    </div>
  )
}
